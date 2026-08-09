import type { MetadataRoute } from "next";
import { getSubstackPosts } from "@/lib/substack";

const siteUrl = "https://ognjenadzic.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSubstackPosts();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/writing/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
