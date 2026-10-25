import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { RouterContextProvider, StaticRouter } from "react-router";
import Home, { headers as homeHeaders, loader as homeLoader } from "../app/routes/home";
import { headers as writingHeaders } from "../app/routes/writing";
import { headers as postHeaders } from "../app/routes/writing-post";
import { cloudflareEnvContext } from "../src/lib/cloudflare-context";
import { getSubstackPost, getSubstackPosts, refreshSubstackPosts, substackPostsKey } from "../src/lib/substack.server";

const savedPost = {
  slug: "saved-post",
  title: "Previously saved post",
  description: "Saved excerpt",
  content: "<p>Saved article</p>",
  url: "https://ognjenadzic.substack.com/p/saved-post",
  publishedAt: "2026-08-16T09:57:41.000Z",
  author: "Ognjen Adzic",
  coverImage: undefined,
};

function feed(slug = "new-post", title = "Newly published post") {
  return new Response(`<?xml version="1.0"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel><item>
        <title>${title}</title>
        <link>https://ognjenadzic.substack.com/p/${slug}</link>
        <description>Current excerpt</description>
        <pubDate>Sun, 25 Oct 2026 10:00:00 GMT</pubDate>
        <content:encoded><![CDATA[<p>Current article</p>]]></content:encoded>
      </item></channel>
    </rss>`);
}

function store(posts = [savedPost]) {
  return { get: async () => posts };
}

let now = Date.parse("2026-10-25T12:00:00Z");

beforeEach((t) => {
  // Each test starts beyond the previous isolate-local feed cache entry.
  now += 60_000;
  t.mock.timers.enable({ apis: ["Date"], now });
  t.mock.method(console, "error", () => {});
  t.mock.method(console, "warn", () => {});
});

test("current feed wins over the older saved snapshot", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => feed());
  const saved = store();
  const read = t.mock.method(saved, "get");

  const posts = await getSubstackPosts(saved);

  assert.equal(posts[0].slug, "new-post");
  assert.equal(read.mock.callCount(), 0);
  assert.equal(fetch.mock.calls[0].arguments[1].cache, "no-store");
  assert.equal(fetch.mock.calls[0].arguments[1].headers["Cache-Control"], "no-cache");
});

test("a newly published post is visible after ten seconds without a cron run", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => feed());
  const saved = store();
  await getSubstackPosts(saved);

  fetch.mock.mockImplementation(async () => feed("just-published", "Just published"));
  t.mock.timers.tick(9_999);
  assert.equal((await getSubstackPosts(saved))[0].slug, "new-post");
  assert.equal(fetch.mock.callCount(), 1);

  t.mock.timers.tick(1);
  assert.equal((await getSubstackPosts(saved))[0].slug, "just-published");
  assert.equal(fetch.mock.callCount(), 2);
});

test("concurrent readers share one live fetch", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => feed());
  const saved = store();
  const results = await Promise.all([
    getSubstackPosts(saved),
    getSubstackPosts(saved),
    getSubstackPost("new-post", saved),
  ]);

  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(results[2].slug, "new-post");
});

test("upstream failures use saved posts without retry delays", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  assert.deepEqual(await getSubstackPosts(store()), [savedPost]);
  assert.equal(fetch.mock.callCount(), 1);
});

test("a stalled feed falls back within the foreground timeout", async (t) => {
  t.mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }));
  // AbortSignal's timer is unreferenced, so keep this test alive until it fires.
  const keepAlive = setTimeout(() => {}, 3_000);
  const started = performance.now();
  try {
    assert.deepEqual(await getSubstackPosts(store()), [savedPost]);
    assert.ok(performance.now() - started < 2_750);
  } finally {
    clearTimeout(keepAlive);
  }
});

test("a failed refresh is retried on the next request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  assert.equal((await getSubstackPosts(store()))[0].slug, "saved-post");
  fetch.mock.mockImplementation(async () => feed());
  assert.equal((await getSubstackPosts(store()))[0].slug, "new-post");
});

test("scheduled sync retries and saves the current feed as the outage fallback", async (t) => {
  let attempt = 0;
  t.mock.method(globalThis, "fetch", async () => ++attempt === 1
    ? new Response("Unavailable", { status: 503, headers: { "Retry-After": "0" } })
    : feed());
  t.mock.method(console, "log", () => {});
  const writes = [];
  const saved = { put: async (...args) => writes.push(args) };

  await refreshSubstackPosts(saved);

  assert.equal(attempt, 2);
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], substackPostsKey);
  assert.equal(JSON.parse(writes[0][1])[0].slug, "new-post");
  assert.equal(writes[0][2].metadata.count, 1);
  assert.equal(writes[0][2].metadata.refreshedAt, new Date().toISOString());
});

test("invalid upstream data never overwrites the outage fallback", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("<rss><channel /></rss>"));
  const saved = { put: async () => {} };
  const put = t.mock.method(saved, "put");

  await assert.rejects(refreshSubstackPosts(saved), /no valid posts/);
  assert.equal(put.mock.callCount(), 0);
});

test("an unavailable feed and missing snapshot never resurrect bundled August posts", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("Unavailable", { status: 503 }));
  assert.deepEqual(await getSubstackPosts(store(null)), []);
});

test("initial home HTML already contains current writing", async (t) => {
  t.mock.method(globalThis, "fetch", async () => feed());
  const context = new RouterContextProvider();
  context.set(cloudflareEnvContext, { PORTFOLIO_WRITING_FEED: store() });
  const loaderData = await homeLoader({ context });
  const html = renderToString(createElement(StaticRouter, { location: "/" },
    createElement(Home, { loaderData }),
  ));

  assert.match(html, /Newly published post/);
  assert.match(html, /href="\/writing\/new-post"/);
  assert.doesNotMatch(html, /Previously saved post|A signal is not a guarantee|AI makes learning more important/);
});

test("writing pages cannot serve stale document or navigation responses", () => {
  for (const headers of [homeHeaders, writingHeaders, postHeaders]) {
    assert.equal(headers()["Cache-Control"], "no-store");
  }
});
