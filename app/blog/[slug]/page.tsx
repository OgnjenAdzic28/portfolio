import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/app/components/nav/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import BlogPostContent from "./blog-post-content";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Helper function to decode and normalize slugs
function normalizeSlug(slug: string): string {
  try {
    // First decode any URL encoding
    const decoded = decodeURIComponent(slug);
    // Handle various edge cases and normalize
    return decoded.trim();
  } catch (error) {
    // If decoding fails, return the original slug
    console.warn("Failed to decode slug:", slug, error);
    return slug;
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const post = await getPostBySlug(normalizedSlug);

  if (!post) {
    return {
      title: "Post Not Found - Ognjen Adzic",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} - Ognjen Adzic`,
    description: post.excerpt || "Read this blog post by Ognjen Adzic",
    keywords: [
      ...post.tags,
      "blog",
      "development",
      "entrepreneurship",
      "technology",
    ],
    authors: [{ name: post.author.name }],
    creator: post.author.name,
    publisher: "Ognjen Adzic",
    openGraph: {
      title: post.title,
      description: post.excerpt || "Read this blog post by Ognjen Adzic",
      url: `https://ognjen.dev/blog/${post.slug}`,
      siteName: "Ognjen Adzic",
      type: "article",
      locale: "en_US",
      publishedTime: post.publishedDate,
      authors: [post.author.name],
      tags: [...post.tags],
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || "Read this blog post by Ognjen Adzic",
      creator: "@ognjen",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://ognjen.dev/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const post = await getPostBySlug(normalizedSlug);

  if (!post) {
    notFound();
  }

  // Get the content - read the raw file content directly to get the actual Markdown
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  let renderedContent: React.ReactNode = null;
  const isMarkdown = true; // Force Markdown rendering since content is written in Markdown syntax

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
      renderedContent = fileContent.slice(frontmatterEnd + 3).trim();
    } else {
      renderedContent = fileContent;
    }
  } catch (error) {
    console.error("Error reading file:", error);
    // Fallback to the original content
    const contentResult = await post.content();
    if (typeof contentResult === "string") {
      renderedContent = contentResult;
    } else {
      renderedContent = String(contentResult);
    }
  }

  // Transform post to exclude the content function for client component
  const postForClient = {
    slug: post.slug,
    title: post.title,
    publishedDate: post.publishedDate,
    excerpt: post.excerpt,
    readTime: post.readTime,
    featured: post.featured,
    tags: post.tags,
    coverImage: post.coverImage,
    author: {
      name: post.author.name,
      avatar: post.author.avatar,
    },
  };

  return (
    <div className="min-h-screen">
      <main className="flex-1 min-h-screen">
        <BlogPostContent
          post={postForClient}
          renderedContent={renderedContent}
          isMarkdown={isMarkdown}
        />
      </main>
      <Footer isHomePage={true} />
    </div>
  );
}
