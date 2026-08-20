import type { GitHubContributionData } from "@/lib/github-contributions.server";
import { formatPostDate, type SubstackPost } from "@/lib/substack";

export type HomeWritingItem = {
  description: string;
  formattedDate: string;
  publishedAt: string;
  slug: string;
  title: string;
};

export type HomeData = {
  contributions: GitHubContributionData;
  writing: HomeWritingItem[];
};

export const emptyContributions: GitHubContributionData = {
  available: false,
  columns: [],
  counts: {},
  total: null,
};

function cleanExcerpt(description: string) {
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function toHomeWriting(posts: SubstackPost[]): HomeWritingItem[] {
  return posts.slice(0, 6).map((post) => ({
    description: cleanExcerpt(post.description),
    formattedDate: formatPostDate(post.publishedAt),
    publishedAt: post.publishedAt,
    slug: post.slug,
    title: post.title,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWritingItem(value: unknown): value is HomeWritingItem {
  return (
    isRecord(value) &&
    typeof value.description === "string" &&
    typeof value.formattedDate === "string" &&
    typeof value.publishedAt === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string"
  );
}

function parseDate(value: unknown) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function parseHomeData(value: unknown): HomeData | null {
  if (!isRecord(value) || !isRecord(value.contributions)) {
    return null;
  }

  const contributions = value.contributions;
  if (!Array.isArray(value.writing) || !Array.isArray(contributions.columns)) {
    return null;
  }

  const rawWriting = value.writing;
  const rawColumns = contributions.columns;
  const writing = rawWriting.filter(isWritingItem);
  const columns = rawColumns.flatMap((column) => {
        if (!isRecord(column) || typeof column.bin !== "number") {
          return [];
        }

        const bins = Array.isArray(column.bins)
          ? column.bins.flatMap((bin) => {
              if (
                !isRecord(bin) ||
                typeof bin.bin !== "number" ||
                typeof bin.count !== "number"
              ) {
                return [];
              }

              const date = parseDate(bin.date);

              return date ? [{ bin: bin.bin, count: bin.count, date }] : [];
            })
          : [];

        return bins.length > 0 ? [{ bin: column.bin, bins }] : [];
      });
  const counts = isRecord(contributions.counts)
    ? Object.fromEntries(
        Object.entries(contributions.counts).filter(
          (entry): entry is [string, number] => typeof entry[1] === "number",
        ),
      )
    : {};

  if (
    writing.length !== rawWriting.length ||
    columns.length !== rawColumns.length ||
    typeof contributions.available !== "boolean" ||
    (typeof contributions.total !== "number" && contributions.total !== null)
  ) {
    return null;
  }

  return {
    contributions: {
      available: contributions.available,
      columns,
      counts,
      total: contributions.total,
    },
    writing,
  };
}
