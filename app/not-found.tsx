"use client";

import Link from "next/link";
import { motion } from "motion/react";
import Header from "./components/nav/Header";
import Footer from "./components/nav/Footer";

export default function NotFound() {
  // Animation variants for the content
  const contentVariants = {
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

  const buttonVariants = {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          {/* 404 Title */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="space-y-4"
          >
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-t from-foreground/60 to-muted-foreground/20 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-medium text-foreground">
              {"did you get a "}
              <span className="font-semibold">little</span>{" "}
              <span className="font-serif italic">lost?</span>
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.4,
            }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Let's get you back on track.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.6,
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-background bg-foreground rounded-full hover:bg-foreground/90 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-muted/50 transition-colors"
            >
              Read Blog
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer isHomePage={false} />
    </div>
  );
}
