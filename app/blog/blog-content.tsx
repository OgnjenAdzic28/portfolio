"use client";

import { motion } from "motion/react";
import PostCard from "@/app/components/ui/post-card";

// Simplified post type for client component (excludes the content function)
interface BlogPostForClient {
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
}

interface BlogContentProps {
  posts: BlogPostForClient[];
}

export default function BlogContent({ posts }: BlogContentProps) {
  // Determine layout based on number of posts
  const shouldUseComplexLayout = posts.length > 4;
  const shouldUseSingleLayout = posts.length === 1;

  // For complex layout (5+ posts)
  const featuredPost = shouldUseComplexLayout
    ? posts.find((post) => post.featured) || posts[0]
    : null;

  const latestPosts = shouldUseComplexLayout
    ? posts.filter((post) => post.slug !== featuredPost?.slug).slice(0, 3)
    : [];

  const gridPosts = shouldUseComplexLayout
    ? posts.filter((post) => post.slug !== featuredPost?.slug).slice(3)
    : [];

  // Animation variants
  const headlineVariants = {
    hidden: {
      y: 20,
      filter: "blur(10px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  const containerVariants = {
    hidden: {
      y: 30,
      filter: "blur(8px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  return (
    <section className="flex flex-col border-l border-r border-b border-dashed border-border max-w-[900px] mx-auto py-16 pt-36 font-sans min-h-screen">
      <div className="w-full px-8 lg:px-16">
        <div className="space-y-12">
          {/* Animated Headline */}
          <div>
            <motion.h1
              variants={headlineVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[32px] font-medium text-foreground tracking-[-1.6px] leading-[38.4px]"
            >
              Welcome to the <span className="font-serif italic">blog.</span>
            </motion.h1>
            <motion.p
              variants={headlineVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[16px] font-medium text-muted-foreground"
            >
              Straightforward advice, practical tips, and smart strategies.
            </motion.p>
          </div>

          {posts.length === 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-lg">
                No blog posts yet. Check back soon!
              </p>
            </motion.div>
          ) : shouldUseSingleLayout ? (
            /* Single Post Layout */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="w-full"
            >
              <PostCard
                postImage={posts[0].coverImage || "/placeholder-blog.jpg"}
                postImageAlt={posts[0].title}
                postTitle={posts[0].title}
                authorName={posts[0].author.name}
                authorAvatar={posts[0].author.avatar || undefined}
                authorAvatarFallback={posts[0].author.name
                  .charAt(0)
                  .toUpperCase()}
                readTime={posts[0].readTime}
                href={`/blog/${posts[0].slug}`}
                className="w-full"
              />
            </motion.div>
          ) : !shouldUseComplexLayout ? (
            /* Simple Grid Layout (2-4 posts) */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  postImage={post.coverImage || "/placeholder-blog.jpg"}
                  postImageAlt={post.title}
                  postTitle={post.title}
                  authorName={post.author.name}
                  authorAvatar={post.author.avatar || undefined}
                  authorAvatarFallback={post.author.name
                    .charAt(0)
                    .toUpperCase()}
                  readTime={post.readTime}
                  href={`/blog/${post.slug}`}
                />
              ))}
            </motion.div>
          ) : (
            /* Complex Layout (5+ posts) */
            <>
              {/* Hero Section - Featured Post + Latest 3 */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                transition={{
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
              >
                {/* Large Featured Post */}
                {featuredPost && (
                  <div className="lg:col-span-2">
                    <PostCard
                      postImage={
                        featuredPost.coverImage || "/placeholder-blog.jpg"
                      }
                      postImageAlt={featuredPost.title}
                      postTitle={featuredPost.title}
                      authorName={featuredPost.author.name}
                      authorAvatar={featuredPost.author.avatar || undefined}
                      authorAvatarFallback={featuredPost.author.name
                        .charAt(0)
                        .toUpperCase()}
                      readTime={featuredPost.readTime}
                      href={`/blog/${featuredPost.slug}`}
                      className="h-full"
                    />
                  </div>
                )}

                {/* Latest 3 Posts Stacked */}
                <div className="flex flex-col gap-4">
                  {latestPosts.map((post) => (
                    <PostCard
                      key={post.slug}
                      postImage={post.coverImage || "/placeholder-blog.jpg"}
                      postImageAlt={post.title}
                      postTitle={post.title}
                      authorName={post.author.name}
                      authorAvatar={post.author.avatar || undefined}
                      authorAvatarFallback={post.author.name
                        .charAt(0)
                        .toUpperCase()}
                      readTime={post.readTime}
                      href={`/blog/${post.slug}`}
                      className="flex-1"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Grid Section - Remaining Posts */}
              {gridPosts.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    duration: 0.6,
                    delay: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {gridPosts.map((post) => (
                    <PostCard
                      key={post.slug}
                      postImage={post.coverImage || "/placeholder-blog.jpg"}
                      postImageAlt={post.title}
                      postTitle={post.title}
                      authorName={post.author.name}
                      authorAvatar={post.author.avatar || undefined}
                      authorAvatarFallback={post.author.name
                        .charAt(0)
                        .toUpperCase()}
                      readTime={post.readTime}
                      href={`/blog/${post.slug}`}
                    />
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
