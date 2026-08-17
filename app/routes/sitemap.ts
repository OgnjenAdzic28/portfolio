import { getSubstackPosts } from "@/lib/substack.server";
import { cloudflareEnvContext } from "@/lib/cloudflare-context";
import { getSecurityHeaders } from "@/lib/security-headers.server";
import type { Route } from "./+types/sitemap";

const siteUrl = "https://ognjenadzic.com";

function urlEntry(
  path: string,
  lastModified: string,
  changeFrequency: "weekly" | "monthly",
  priority: number,
) {
  return [
    "  <url>",
    `    <loc>${siteUrl}${path}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    `    <changefreq>${changeFrequency}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(cloudflareEnvContext);
  const posts = await getSubstackPosts(env.PORTFOLIO_WRITING_FEED);
  const now = new Date().toISOString();
  const entries = [
    urlEntry("/", now, "monthly", 1),
    urlEntry("/writing", now, "weekly", 0.9),
    urlEntry("/favorites", now, "monthly", 0.8),
    ...posts.map((post) =>
      urlEntry(
        `/writing/${encodeURIComponent(post.slug)}`,
        post.publishedAt,
        "monthly",
        0.7,
      ),
    ),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      ...getSecurityHeaders(),
      "Cache-Control": "s-maxage=60, stale-while-revalidate=240",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
