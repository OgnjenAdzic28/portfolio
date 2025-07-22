import { createReader } from "@keystatic/core/reader";
import config from "../keystatic.config";

export const reader = createReader(process.cwd(), config);

export type BlogPost = {
  slug: string;
  title: string;
  publishedDate: string;
  excerpt: string;
  readTime: number;
  featured: boolean;
  tags: readonly string[];
  coverImage: string | null;
  author: {
    name: string;
    avatar: string | null;
  };
  content: () => Promise<string>;
};

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await reader.collections.posts.all();

  return posts
    .filter((post) => post.entry.publishedDate !== null) // Only include posts with published dates
    .map((post) => ({
      slug: post.slug,
      title: post.entry.title,
      publishedDate: post.entry.publishedDate!,
      excerpt: post.entry.excerpt || "",
      readTime: post.entry.readTime || 5,
      featured: post.entry.featured,
      tags: post.entry.tags || [],
      coverImage: post.entry.coverImage,
      author: {
        name: post.entry.author?.name || "ognjen",
        avatar: post.entry.author?.avatar,
      },
      content: async () => {
        // Read the raw markdown file content directly
        const fs = await import("node:fs/promises");
        const path = await import("node:path");

        try {
          const filePath = path.join(
            process.cwd(),
            "content",
            "posts",
            `${post.slug}.mdoc`
          );
          const fileContent = await fs.readFile(filePath, "utf-8");

          // Extract content after the frontmatter
          const frontmatterEnd = fileContent.indexOf("---", 3);
          if (frontmatterEnd !== -1) {
            return fileContent.slice(frontmatterEnd + 3).trim();
          } else {
            return fileContent;
          }
        } catch (error) {
          console.error("Error reading file:", error);
          // Fallback to Keystatic content
          const contentResult = await post.entry.content();
          return String(contentResult);
        }
      },
    }))
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime()
    );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // Try to read the post with the provided slug first
    let post = await reader.collections.posts.read(slug);

    // If not found and slug contains encoded characters, try decoding
    if (!post && slug.includes("%")) {
      try {
        const decodedSlug = decodeURIComponent(slug);
        post = await reader.collections.posts.read(decodedSlug);
      } catch (decodeError) {
        console.warn("Failed to decode slug:", slug, decodeError);
      }
    }

    // If still not found, try all posts and find by matching slug patterns
    if (!post) {
      const allPosts = await reader.collections.posts.all();
      const matchingPost = allPosts.find((p) => {
        // Try exact match, URL encoded match, or normalized match
        return (
          p.slug === slug ||
          encodeURIComponent(p.slug) === slug ||
          p.slug.replace(/\s+/g, "-").toLowerCase() === slug.toLowerCase()
        );
      });

      if (matchingPost) {
        post = matchingPost.entry;
        slug = matchingPost.slug; // Use the actual slug from the file system
      }
    }

    if (!post || !post.publishedDate) return null;

    return {
      slug,
      title: post.title,
      publishedDate: post.publishedDate,
      excerpt: post.excerpt || "",
      readTime: post.readTime || 5,
      featured: post.featured,
      tags: post.tags || [],
      coverImage: post.coverImage,
      author: {
        name: post.author?.name || "ognjen",
        avatar: post.author?.avatar,
      },
      content: async () => {
        // Read the raw markdown file content directly
        const fs = await import("node:fs/promises");
        const path = await import("node:path");

        try {
          const filePath = path.join(
            process.cwd(),
            "content",
            "posts",
            `${slug}.mdoc`
          );
          const fileContent = await fs.readFile(filePath, "utf-8");

          // Extract content after the frontmatter
          const frontmatterEnd = fileContent.indexOf("---", 3);
          if (frontmatterEnd !== -1) {
            return fileContent.slice(frontmatterEnd + 3).trim();
          } else {
            return fileContent;
          }
        } catch (error) {
          console.error("Error reading file:", error);
          // Fallback to Keystatic content
          const contentResult = await post.content();
          return String(contentResult);
        }
      },
    };
  } catch (error) {
    console.error("Error reading post:", error);
    return null;
  }
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.featured);
}
