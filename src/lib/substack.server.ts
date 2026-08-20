import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";
import { substackUrl, type SubstackPost } from "@/lib/substack";
import { withTimedCache } from "@/lib/timed-cache.server";

const feedUrl = `${substackUrl}/feed`;
const substackOrigin = new URL(substackUrl).origin;
const maxFeedBytes = 2_000_000;
const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const feedFetchAttempts = 3;
const liveFeedCacheMilliseconds = 60_000;
export const substackPostsKey = "substack-posts:v1";

export const bundledFallbackPosts: SubstackPost[] = [
  {
    slug: "a-signal-is-not-a-guarantee",
    title: "A signal is not a guarantee",
    description:
      "The trouble starts when a narrow result becomes a conclusion about the whole system.",
    content:
      '<p>This article is temporarily unavailable here. You can <a href="https://ognjenadzic.substack.com/p/a-signal-is-not-a-guarantee" rel="noopener noreferrer" target="_blank">read it on Substack</a>.</p>',
    url: "https://ognjenadzic.substack.com/p/a-signal-is-not-a-guarantee",
    publishedAt: "2026-08-16T09:57:41.000Z",
    author: "Ognjen Adzic",
    coverImage:
      "https://substack-post-media.s3.amazonaws.com/public/images/92dc5fbe-3107-48d6-a1d4-ddad92e27c72_2400x1260.png",
  },
  {
    slug: "ai-makes-learning-more-important",
    title: "AI makes learning more important",
    description:
      "AI can one-shot a convincing demo. Reliable software still requires judgment, verification, and enough knowledge to know when the model is wrong.",
    content:
      '<p>This article is temporarily unavailable here. You can <a href="https://ognjenadzic.substack.com/p/ai-makes-learning-more-important" rel="noopener noreferrer" target="_blank">read it on Substack</a>.</p>',
    url: "https://ognjenadzic.substack.com/p/ai-makes-learning-more-important",
    publishedAt: "2026-08-09T17:18:43.000Z",
    author: "Ognjen Adzic",
    coverImage:
      "https://substack-post-media.s3.amazonaws.com/public/images/0c5953bb-0214-4421-9e31-7d8ffe7c3dbb_2400x1260.png",
  },
];

type FeedItem = {
  title?: string;
  description?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  enclosure?: {
    url?: string;
  };
  "dc:creator"?: string;
  "content:encoded"?: string;
};

type ParsedFeed = {
  rss?: {
    channel?: {
      item?: FeedItem | FeedItem[];
    };
  };
};

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  trimValues: false,
});

function getPostIdentity(item: FeedItem) {
  const itemUrl = item.link ?? item.guid;

  if (typeof itemUrl !== "string") {
    return null;
  }

  try {
    const url = new URL(itemUrl);

    if (
      url.protocol !== "https:" ||
      url.origin !== substackOrigin ||
      url.username ||
      url.password
    ) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const postSegment = segments.indexOf("p");
    const slug = decodeURIComponent(segments[postSegment + 1] ?? "");

    if (postSegment < 0 || !postSlugPattern.test(slug)) {
      return null;
    }

    return { slug, url: url.toString() };
  } catch {
    return null;
  }
}

function cleanPostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "del",
      "div",
      "em",
      "figcaption",
      "figure",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "picture",
      "pre",
      "s",
      "source",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "u",
      "ul",
    ],
    allowedAttributes: {
      "*": ["class"],
      a: ["aria-label", "href", "name", "rel", "target", "title"],
      img: [
        "alt",
        "decoding",
        "height",
        "loading",
        "referrerpolicy",
        "sizes",
        "src",
        "srcset",
        "title",
        "width",
      ],
      source: ["media", "sizes", "src", "srcset", "type"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["https"],
      source: ["https"],
      srcset: ["https"],
    },
    allowProtocolRelative: false,
    exclusiveFilter(frame) {
      return frame.attribs.class?.split(" ").some((className) =>
        [
          "image-link-expand",
          "subscription-widget-wrap-editor",
          "subscription-widget",
        ].includes(className),
      ) ?? false;
    },
    transformTags: {
      a(tagName, attribs) {
        if (!attribs.href?.startsWith("http")) {
          return { tagName, attribs };
        }

        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
            target: "_blank",
          },
        };
      },
      img(tagName, attribs) {
        return {
          tagName,
          attribs: {
            ...attribs,
            decoding: "async",
            loading: "lazy",
            referrerpolicy: "no-referrer",
          },
        };
      },
    },
  });
}

function toPost(item: FeedItem): SubstackPost | null {
  const identity = getPostIdentity(item);
  const rawContent = item["content:encoded"];
  const publishedAt =
    typeof item.pubDate === "string" ? Date.parse(item.pubDate) : Number.NaN;

  if (
    !identity ||
    typeof item.title !== "string" ||
    typeof rawContent !== "string" ||
    !Number.isFinite(publishedAt)
  ) {
    return null;
  }

  const content = cleanPostHtml(rawContent);

  if (!content) {
    return null;
  }

  return {
    slug: identity.slug,
    title: item.title,
    description: typeof item.description === "string" ? item.description : "",
    content,
    url: identity.url,
    publishedAt: new Date(publishedAt).toISOString(),
    author:
      typeof item["dc:creator"] === "string"
        ? item["dc:creator"]
        : "Ognjen Adzic",
    coverImage:
      typeof item.enclosure?.url === "string" &&
      item.enclosure.url.startsWith("https://")
        ? item.enclosure.url
        : undefined,
  };
}

function normalizeStoredPost(value: unknown): SubstackPost | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const identity = getPostIdentity({
    link: typeof candidate.url === "string" ? candidate.url : undefined,
  });
  const publishedAt =
    typeof candidate.publishedAt === "string"
      ? Date.parse(candidate.publishedAt)
      : Number.NaN;

  if (
    !identity ||
    identity.slug !== candidate.slug ||
    typeof candidate.title !== "string" ||
    typeof candidate.description !== "string" ||
    typeof candidate.content !== "string" ||
    typeof candidate.author !== "string" ||
    !Number.isFinite(publishedAt)
  ) {
    return null;
  }

  return {
    slug: identity.slug,
    title: candidate.title,
    description: candidate.description,
    content: cleanPostHtml(candidate.content),
    url: identity.url,
    publishedAt: new Date(publishedAt).toISOString(),
    author: candidate.author,
    coverImage:
      typeof candidate.coverImage === "string" &&
      candidate.coverImage.startsWith("https://")
        ? candidate.coverImage
        : undefined,
  };
}

function logFeedError(message: string, error: unknown) {
  console.error(
    JSON.stringify({
      event: "substack_feed_error",
      message,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}

function logFeedAttemptFailure(attempt: number, error: unknown) {
  console.warn(
    JSON.stringify({
      event: "substack_feed_attempt_failed",
      attempt,
      attempts: feedFetchAttempts,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}

function getRetryDelayMilliseconds(response: Response, attempt: number) {
  const retryAfter = response.headers.get("retry-after");
  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, 10_000);
  }

  const retryAt = retryAfter ? Date.parse(retryAfter) : Number.NaN;

  if (Number.isFinite(retryAt)) {
    return Math.min(Math.max(retryAt - Date.now(), 0), 10_000);
  }

  return attempt * 1_000;
}

async function fetchFeed() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= feedFetchAttempts; attempt += 1) {
    let retryDelayMilliseconds = attempt * 1_000;

    try {
      const response = await fetch(feedUrl, {
        headers: {
          Accept: "application/rss+xml, application/xml;q=0.9",
          "User-Agent": "OgnjenPortfolioFeedSync/1.0 (+https://ognjenadzic.com)",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(8_000),
      });

      if (response.ok) {
        return response;
      }

      lastError = new Error(`Substack feed returned ${response.status}`);
      retryDelayMilliseconds = getRetryDelayMilliseconds(response, attempt);
    } catch (error) {
      lastError = error;
    }

    logFeedAttemptFailure(attempt, lastError);

    if (attempt < feedFetchAttempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelayMilliseconds),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to fetch the Substack feed");
}

async function loadSubstackFeed() {
  const response = await fetchFeed();
  const contentLength = Number(response.headers.get("content-length"));

  if (Number.isFinite(contentLength) && contentLength > maxFeedBytes) {
    throw new Error("Substack feed exceeded the size limit");
  }

  const rawFeed = await response.text();

  if (Buffer.byteLength(rawFeed, "utf8") > maxFeedBytes) {
    throw new Error("Substack feed exceeded the size limit");
  }

  const feed = parser.parse(rawFeed) as ParsedFeed;
  const rawItems = feed.rss?.channel?.item;
  const items = rawItems
    ? Array.isArray(rawItems)
      ? rawItems
      : [rawItems]
    : [];

  const posts = items
    .map(toPost)
    .filter((post): post is SubstackPost => post !== null)
    .sort(
      (first, second) =>
        new Date(second.publishedAt).getTime() -
        new Date(first.publishedAt).getTime(),
    );

  if (posts.length === 0) {
    throw new Error("Substack feed contained no valid posts");
  }

  return posts;
}

function getLiveSubstackPosts() {
  return withTimedCache(
    "substack-live-feed",
    liveFeedCacheMilliseconds,
    loadSubstackFeed,
  );
}

export async function refreshSubstackPosts(store: KVNamespace) {
  try {
    const posts = await loadSubstackFeed();
    const refreshedAt = new Date().toISOString();

    await store.put(substackPostsKey, JSON.stringify(posts), {
      metadata: { count: posts.length, refreshedAt },
    });

    console.log(
      JSON.stringify({
        event: "substack_feed_refreshed",
        count: posts.length,
        refreshedAt,
      }),
    );

    return posts;
  } catch (error) {
    logFeedError("Unable to refresh the Substack feed", error);
    throw error;
  }
}

export async function getSubstackPosts(
  store: KVNamespace,
): Promise<SubstackPost[]> {
  try {
    const value: unknown = await store.get(substackPostsKey, "json");

    if (!Array.isArray(value)) {
      throw new Error("Stored Substack feed is missing or invalid");
    }

    const posts = value
      .map(normalizeStoredPost)
      .filter((post): post is SubstackPost => post !== null);

    if (posts.length === 0 || posts.length !== value.length) {
      throw new Error("Stored Substack feed contained invalid posts");
    }

    return posts;
  } catch (error) {
    logFeedError("Unable to read the stored Substack feed", error);

    try {
      return await getLiveSubstackPosts();
    } catch (feedError) {
      logFeedError("Unable to load the live Substack feed", feedError);
      return bundledFallbackPosts;
    }
  }
}

export async function getSubstackPost(slug: string, store: KVNamespace) {
  try {
    const posts = await getLiveSubstackPosts();
    return posts.find((post) => post.slug === slug) ?? null;
  } catch (error) {
    logFeedError("Unable to load the live Substack article", error);
  }

  const posts = await getSubstackPosts(store);

  return posts.find((post) => post.slug === slug) ?? null;
}
