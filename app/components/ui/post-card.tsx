"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

interface PostCardProps {
  postImage: string;
  postImageAlt: string;
  postTitle: string;
  authorName: string;
  authorAvatar?: string;
  authorAvatarFallback?: string;
  readTime?: number;
  href?: string;
  className?: string;
}

export default function PostCard({
  postImage,
  postImageAlt,
  postTitle,
  authorName,
  authorAvatar,
  authorAvatarFallback,
  readTime,
  href,
  className = "",
}: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href || "#"} className="block w-full h-full">
      <button
        type="button"
        className={`flex flex-col cursor-pointer w-full justify-between flex-1 relative p-4 text-left ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated backdrop */}
        <motion.div
          className="absolute inset-0 bg-muted/40 rounded-2xl"
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 1 : 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          style={{ zIndex: 0 }}
        />
        {/* First container - Post Image */}
        <div className="relative w-full aspect-video overflow-hidden rounded-xl z-10 flex-1">
          <Image
            src={postImage}
            alt={postImageAlt}
            fill
            className="object-cover"
          />
        </div>

        {/* Second container - Post Title and Author */}
        <div className="flex items-center gap-3 mt-4 relative z-10">
          <Avatar className="size-8">
            {authorAvatar && (
              <AvatarImage src={authorAvatar} alt={`${authorName} avatar`} />
            )}
            <AvatarFallback>
              {authorAvatarFallback || authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col max-w-[75%]">
            <h3 className="text-sm font-medium text-foreground line-clamp-2 overflow-hidden text-ellipsis">
              {postTitle}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{authorName}</span>
              {readTime && (
                <>
                  <span>•</span>
                  <span>{readTime} min read</span>
                </>
              )}
            </div>
          </div>
        </div>
      </button>
    </Link>
  );
}
