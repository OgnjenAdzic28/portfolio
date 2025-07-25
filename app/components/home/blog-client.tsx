"use client";

import { motion } from "motion/react";
import Link from "next/link";
import PostCard from "@/app/components/ui/post-card";
import type { BlogPost } from "@/lib/blog";

interface BlogClientProps {
  posts: Omit<BlogPost, "content">[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  // Simple title
  const titleText = "Latest Posts";

  // Animation variants for title
  const titleVariants = {
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

  // Animation variants for cards
  const cardVariants = {
    hidden: {
      y: 30,
      filter: "blur(10px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  return (
    <section className="flex flex-col items-center justify-start border-l border-r border-b border-dashed border-border max-w-[900px] mx-auto py-16">
      <div className="w-full px-8 lg:px-16">
        <div className="space-y-2">
          {/* Title with View All Link */}
          <div className="flex items-center justify-between">
            <motion.h1
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-[22px] font-medium text-foreground"
            >
              {titleText}
            </motion.h1>

            <motion.div
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </motion.div>
          </div>

          {/* Cards Container */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-4">
            {posts.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">
                  No blog posts yet. Check back soon!
                </p>
              </div>
            ) : (
              posts.slice(0, 4).map((post, index) => (
                <motion.div
                  key={post.slug}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <PostCard
                    postImage={
                      post.coverImage || "/images/blog/default-cover.jpg"
                    }
                    postImageAlt={`${post.title} cover image`}
                    postTitle={post.title
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    authorName={post.author.name}
                    authorAvatar={post.author.avatar || undefined}
                    authorAvatarFallback={post.author.name
                      .charAt(0)
                      .toUpperCase()}
                    readTime={post.readTime}
                    href={`/blog/${post.slug}`}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
