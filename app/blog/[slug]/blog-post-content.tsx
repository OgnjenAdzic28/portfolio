"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EnhancedContent from "./enhanced-content";
import MarkdownRenderer from "./markdown-renderer";
import "../blog-styles.css";

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

interface BlogPostContentProps {
  post: BlogPostForClient;
  renderedContent: React.ReactNode;
  isMarkdown: boolean;
}

export default function BlogPostContent({
  post,
  renderedContent,
  isMarkdown,
}: BlogPostContentProps) {
  // Animation variants
  const headerVariants = {
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

  const contentVariants = {
    hidden: {
      y: 20,
      filter: "blur(8px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  const backLinkVariants = {
    hidden: {
      y: 10,
      filter: "blur(6px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  return (
    <section className="flex flex-col border-l border-r border-b border-dashed border-border max-w-[900px] mx-auto py-16 pt-36 font-sans">
      <div className="w-full px-8 lg:px-16">
        <div className="space-y-8">
          {/* Back Link */}
          <motion.div
            variants={backLinkVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              ← Back to Blog
            </Link>
          </motion.div>

          {/* Cover Image */}
          {post.coverImage && (
            <motion.div
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full aspect-video overflow-hidden rounded-xl"
            >
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Article Header */}
          <motion.header
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.8,
              delay: post.coverImage ? 0.4 : 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="space-y-6"
          >
            {/* Title */}
            <h1 className="text-[32px] font-medium text-foreground tracking-[-1.6px] leading-[38.4px]">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  {post.author.avatar && (
                    <AvatarImage
                      src={post.author.avatar}
                      alt={`${post.author.name} avatar`}
                    />
                  )}
                  <AvatarFallback>
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {post.author.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <time>{formatDate(post.publishedDate)}</time>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </div>

              {post.featured && (
                <span className="bg-foreground text-background text-xs px-3 py-1 rounded-full font-medium">
                  Featured
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-base text-muted-foreground leading-[25px] max-w-[650px]">
                {post.excerpt}
              </p>
            )}
          </motion.header>

          {/* Article Content */}
          <motion.article
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.6,
              delay: post.coverImage ? 0.6 : 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20
              prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
              prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
              prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
              prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4
              prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4 prose-h5:font-semibold
              prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:font-semibold prose-h6:text-muted-foreground
              prose-p:text-muted-foreground prose-p:leading-[25px] prose-p:mb-4
              prose-a:text-foreground prose-a:no-underline hover:prose-a:underline prose-a:transition-colors prose-a:font-medium
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:text-foreground prose-em:italic
              prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-border
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm prose-pre:leading-relaxed prose-pre:my-6
              prose-pre:shadow-sm prose-pre:relative
              [&_.code-block-wrapper]:relative [&_.code-block-wrapper]:group
              prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:my-6
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-1
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-1
              prose-li:text-muted-foreground prose-li:leading-[25px] prose-li:my-1
              prose-li:marker:text-foreground
              prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-6 prose-table:shadow-sm
              prose-thead:bg-muted/50
              prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold prose-th:text-foreground prose-th:text-sm
              prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3 prose-td:text-muted-foreground prose-td:text-sm
              prose-tbody:prose-tr:hover:bg-muted/20
              prose-hr:border-border prose-hr:my-8 prose-hr:border-t
              prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-sm prose-img:my-6
              prose-figure:my-8 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-2 prose-figcaption:italic"
          >
            {isMarkdown ? (
              <MarkdownRenderer content={renderedContent as string} />
            ) : (
              <EnhancedContent>{renderedContent}</EnhancedContent>
            )}
          </motion.article>
        </div>
      </div>
    </section>
  );
}
