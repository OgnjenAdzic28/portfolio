import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";
import { substackUrl, type SubstackPost } from "@/lib/substack";
import { withTimedCache } from "@/lib/timed-cache.server";

const feedUrl = `${substackUrl}/feed`;
const substackOrigin = new URL(substackUrl).origin;
const maxFeedBytes = 2_000_000;
const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const refreshIntervalMilliseconds = 60_000;

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

export function getSubstackPosts(): Promise<SubstackPost[]> {
  return withTimedCache(
    "substack-posts",
    refreshIntervalMilliseconds,
    async () => {
      try {
        const response = await fetch(feedUrl, {
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) {
          throw new Error(`Substack feed returned ${response.status}`);
        }

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

        return items
          .map(toPost)
          .filter((post): post is SubstackPost => post !== null)
          .sort(
            (first, second) =>
              new Date(second.publishedAt).getTime() -
              new Date(first.publishedAt).getTime(),
          );
      } catch (error) {
        console.error("Unable to load the Substack feed", error);
        return [];
      }
    },
  );
}

export async function getSubstackPost(slug: string) {
  const posts = await getSubstackPosts();

  return posts.find((post) => post.slug === slug) ?? null;
}
