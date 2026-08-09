import "server-only";

import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";
import { cache } from "react";

export const substackUrl = "https://ognjenadzic.substack.com";

const feedUrl = `${substackUrl}/feed`;
const substackOrigin = new URL(substackUrl).origin;
const maxFeedBytes = 2_000_000;
const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

export type SubstackPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  url: string;
  publishedAt: string;
  author: string;
  coverImage?: string;
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
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "li",
      "ol",
      "p",
      "pre",
      "s",
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
      a: ["href", "name", "rel", "target", "title"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    exclusiveFilter(frame) {
      return frame.attribs.class?.split(" ").some((className) =>
        [
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

export const getSubstackPosts = cache(async (): Promise<SubstackPost[]> => {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 60 },
      redirect: "error",
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
    const items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];

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
});

export async function getSubstackPost(slug: string) {
  const posts = await getSubstackPosts();

  return posts.find((post) => post.slug === slug) ?? null;
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(date));
}
