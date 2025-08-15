"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Footer from "../components/nav/Footer";

export default function AboutPage() {
  // Animation variants for the headline
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

  // Animation variants for the content
  const contentVariants = {
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

  // Animation variants for the signature
  const signatureVariants = {
    hidden: {
      y: 20,
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
    <>
      <section className="flex items-center justify-start border-l border-r border-b border-dashed border-border max-w-[900px] mx-auto py-16 pt-36 font-sans">
        <div className="w-full px-8 lg:px-16">
          <div className="space-y-8">
            {/* Animated Headline */}
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
              Figuring it out as I go.
            </motion.h1>

            {/* Animated Content */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="space-y-6 text-base text-muted-foreground leading-[25px] max-w-[650px]"
            >
              <p>
                I'm a developer and entrepreneur who builds out of curiosity,
                frustration, and the need to make things work better than they
                currently do. I don't follow playbooks — I'd rather question the
                defaults and see what breaks.
              </p>

              <p>
                Right now I'm building{" "}
                <span className="text-foreground font-medium">Cobpot</span> — an
                AI chief of staff that learns from your patterns and handles
                tasks proactively. It gets better the longer you use it,
                handling routine work on your behalf so you can focus on what
                matters.
              </p>

              <p>
                Before that, I started{" "}
                <span className="text-foreground font-medium">Pingless</span> —
                we build web, SaaS, and AI apps that actually work. From
                high-performance landing pages to full-scale systems, we deliver
                software that's fast, reliable, and built for growth.
              </p>

              <p>
                Both ventures started the same way: I saw something missing, and
                couldn't stop thinking about how to fix it.
              </p>

              <p>
                This portfolio isn't a polished pitch — it's a snapshot of what
                I'm building, what I've shipped, and what I'm still figuring
                out. Some things are finished, some aren't, and that's exactly
                how I like it.
              </p>

              <p>Still figuring it out. Still building.</p>
            </motion.div>

            {/* Animated Signature */}
            <motion.div
              variants={signatureVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.5,
                delay: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="pt-8"
            >
              <Image
                src="/ognjen-signature.svg"
                alt="Ognjen's signature"
                width={192}
                height={67}
                className="opacity-60 hover:opacity-80 invert not-dark:invert-0 transition-opacity duration-300"
              />
            </motion.div>
          </div>
        </div>
      </section>
      <Footer isHomePage={true} />
    </>
  );
}
