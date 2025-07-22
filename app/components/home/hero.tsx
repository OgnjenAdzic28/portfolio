"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface HeroSectionProps {
  subtitle: string;
}

export default function HeroSection({ subtitle }: HeroSectionProps) {
  const [titleAnimationComplete, setTitleAnimationComplete] = useState(false);

  // New title with special styling for specific words
  const titleText =
    "Building tools that are fast, focused, and actually useful.";
  const serifWords = ["fast", "focused", "useful"];
  const boldWords = ["actually"];

  // Split title into words and track special ones
  const titleWords = titleText.split(" ").map((word, index) => {
    const cleanWord = word.replace(/[.,]/g, "");
    const isSerif = serifWords.includes(cleanWord);
    const isBold = boldWords.includes(cleanWord);
    return {
      word,
      isSerif,
      isBold,
      id: `word-${index}-${cleanWord}`,
    };
  });

  // Split each word into letters for animation, keeping words grouped
  const titleWordsWithLetters = titleWords.map((wordObj) => {
    const wordLetters = wordObj.word.split("").map((letter, letterIndex) => ({
      letter,
      isSerif: wordObj.isSerif,
      isBold: wordObj.isBold,
      id: `${wordObj.id}-${letterIndex}`,
      globalIndex: -1, // This will be set after flattening
    }));

    return {
      ...wordObj,
      letters: wordLetters,
    };
  });

  // Set global indices for all letters across all words
  let globalIndex = 0;
  titleWordsWithLetters.forEach((wordObj) => {
    wordObj.letters.forEach((letter) => {
      letter.globalIndex = globalIndex;
      globalIndex++;
    });
    // Add index for space after word (except last word)
    if (wordObj !== titleWordsWithLetters[titleWordsWithLetters.length - 1]) {
      globalIndex++;
    }
  });

  // Calculate total letters for animation completion detection
  const totalLetters = titleWordsWithLetters.reduce(
    (total, wordObj) => total + wordObj.letters.length,
    0
  );

  // Animation variants for letters
  const letterVariants = {
    hidden: {
      y: 10,
      filter: "blur(10px)",
      opacity: 0,
    },
    visible: {
      y: 0,
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  // Animation variants for subtitle
  const subtitleVariants = {
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

  return (
    <section className="flex items-center justify-start border-l border-r border-b border-dashed border-border max-w-[900px] mx-auto py-16 pt-36">
      <div className="w-full px-8 lg:px-16">
        <div className="space-y-4">
          {/* Animated Title */}
          <h1 className="text-[32px] font-medium text-foreground tracking-[-1.6px] leading-[38.4px]">
            {titleWordsWithLetters.map((wordObj, wordIndex) => (
              <span
                key={wordObj.id}
                className="inline-block"
                style={{ whiteSpace: "nowrap" }}
              >
                {wordObj.letters.map((letterObj) => (
                  <motion.span
                    key={letterObj.id}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{
                      duration: 1,
                      delay: letterObj.globalIndex * 0.02,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onAnimationComplete={() => {
                      // Set animation complete when the last letter finishes
                      if (letterObj.globalIndex === totalLetters - 1) {
                        setTitleAnimationComplete(true);
                      }
                    }}
                    className={`inline-block ${letterObj.isSerif ? "font-serif" : ""} ${letterObj.isBold ? "font-bold" : ""}`}
                  >
                    {letterObj.letter}
                  </motion.span>
                ))}
                {/* Add space after word except for the last word */}
                {wordIndex < titleWordsWithLetters.length - 1 && (
                  <span className="inline-block">&nbsp;</span>
                )}
              </span>
            ))}
          </h1>

          {/* Animated Subtitle */}
          <motion.p
            variants={subtitleVariants}
            initial="hidden"
            animate={titleAnimationComplete ? "visible" : "hidden"}
            transition={{
              duration: 0.3,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-base text-muted-foreground max-w-[550px] leading-[25px]"
          >
            {subtitle}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
