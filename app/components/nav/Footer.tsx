"use client";

import { motion } from "motion/react";

interface FooterProps {
  isHomePage?: boolean;
}

export default function Footer({ isHomePage = true }: FooterProps) {
  // Animation variants for the text
  const textVariants = {
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
    <section
      className={`relative flex flex-col items-center justify-end max-w-[900px] mx-auto py-4 overflow-hidden ${
        isHomePage ? "border-l border-r border-dashed border-border" : ""
      }`}
    >
      <motion.h1
        variants={textVariants}
        initial="hidden"
        animate="visible"
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-6xl xs:text-8xl md:text-9xl font-bold bg-gradient-to-t from-foreground/60 to-muted-foreground/20 bg-clip-text text-transparent xs:translate-y-12 md:translate-y-16"
      >
        OGNJEN
      </motion.h1>
    </section>
  );
}
