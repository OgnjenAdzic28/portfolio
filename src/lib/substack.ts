export const substackUrl = "https://ognjenadzic.substack.com";

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

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(date));
}
