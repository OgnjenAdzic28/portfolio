"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-md bg-background/80 hover:bg-background border border-border/50 hover:border-border transition-all duration-200 backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Copied</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          ) : (
            <svg
              className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Copy</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        <p>{copied ? "Copied!" : "Copy code"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
