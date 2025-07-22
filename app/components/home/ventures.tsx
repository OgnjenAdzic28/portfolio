"use client";

import { motion } from "motion/react";
import VentureCard from "@/app/components/ui/venture-card";

export default function VenturesSection() {
  // Simple title
  const titleText = "Ventures";

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
          {/* Simplified Animated Title */}
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

          {/* Cards Container */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-4">
            {/* ALFRED Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <VentureCard
                cardImage="/projects/ALFRED-LOGO-FULL.svg"
                cardImageAlt="ALFRED Logo"
                title="ALFRED"
                subtitle="Redefining Assistance with the First True AI Butler"
                bgImage="/projects/nnnoise.svg"
                bgImageOpacityClass="lg:opacity-60 opacity-10"
                bgImageInvert={true}
                bgImageObjectPosition="center"
                isPrimary={true}
                hoverGradientColor="#f5f5f5"
                href="https://tryalfred.app"
              />
            </motion.div>

            {/* Pingless Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <VentureCard
                cardImage="/projects/pingless.svg"
                cardImageInvert={false}
                cardImageObjectFit="contain"
                cardImageWidth="w-22"
                cardImageAlt="Pingless Logo"
                title="Pingless"
                subtitle="Websites That Actually Work."
                bgImage="/projects/Pingless-banner.png"
                bgImageInvert={true}
                bgImageObjectPosition="right top"
                isPrimary={false}
                hoverGradientColor="#00be89"
                href="https://pingless.dev"
              />
            </motion.div>

            {/* ArchiStella Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <VentureCard
                cardImage="/projects/ArchiStella.svg"
                cardImageObjectFit="contain"
                cardImageWidth="w-32"
                cardImageAlt="ArchiStella Logo"
                title="ArchiStella"
                subtitle="B2B marketplace for the maritime industry."
                bgImage="/projects/ffflux.svg"
                bgImageObjectPosition="center"
                bgImageWidth="w-full lg:w-[60%]"
                bgImageOpacityClass="lg:opacity-50 opacity-10"
                hoverGradientColor="#59c0f5"
                isPrimary={false}
              />
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <VentureCard
                cardImage="/projects/maritime@penn.svg"
                cardImageInvert={false}
                cardImageObjectFit="contain"
                cardImageWidth="w-28"
                cardImageAlt="Maritime@Penn Logo"
                title="Maritime@Penn"
                subtitle="Club connecting The University of Pennsylvania with the maritime industry."
                bgImage="/projects/wwwatercolor.webp"
                bgImageObjectPosition="center"
                bgImageOpacityClass="lg:opacity-50 opacity-10"
                href="https://pennmaritime.club/"
                isPrimary={false}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
