"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [scrollState, setScrollState] = useState<
    "checking" | "top" | "scrolled"
  >("checking");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check initial scroll position and mobile state
    const initialScrollY = window.scrollY;
    const isInitiallyScrolled = initialScrollY > 100;
    const isInitiallyMobile = window.innerWidth < 768;

    setScrollState(isInitiallyScrolled ? "scrolled" : "top");
    setIsScrolled(isInitiallyScrolled);
    setIsMobile(isInitiallyMobile);

    // Add scroll listener for ongoing scroll detection
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 100);
    };

    // Add resize listener for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Animation variants for the header based on scroll position
  const headerVariants = {
    hiddenTop: {
      filter: "blur(10px)",
      opacity: 0,
    },
    hiddenScrolled: {
      y: -48, // Start from above (like social dock but from top)
      scale: 0.8, // Start smaller (same as social dock)
      filter: "blur(10px)", // Start blurred (same as social dock)
      opacity: 0, // Start transparent (same as social dock)
    },
    visible: {
      y: 0,
      scale: 1, // Normal size
      filter: "blur(0px)",
      opacity: 1,
    },
  };

  // Don't render until we know the scroll position
  if (scrollState === "checking") {
    return null;
  }

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only expand on mobile when scrolled and showing dots
    if (isMobile && isScrolled) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.header
      key={scrollState} // Force re-render when scroll state changes
      layout // Enable layout animations like social dock
      variants={headerVariants}
      initial={scrollState === "top" ? "hiddenTop" : "hiddenScrolled"}
      animate="visible"
      transition={{
        duration: 0.4, // Match social dock duration
        ease: [0.16, 1, 0.3, 1], // Same easing as social dock
        delay: 0.2, // Small delay like social dock on mount
        layout: { type: "spring", stiffness: 800, damping: 60 }, // Springy layout transition
      }}
      className={`fixed top-6 left-1/2 transform ${isScrolled ? "px-2" : "lg:px-16 px-8"} -translate-x-1/2 z-50 backdrop-blur-md bg-background/80 rounded-[30px] p-2 cursor-pointer md:cursor-default`}
      style={{
        width: isMobile && isScrolled ? "65%" : "100%",
        maxWidth: isScrolled ? "400px" : "900px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: isScrolled ? "var(--border)" : "transparent",
      }}
      onClick={handleHeaderClick}
    >
      <div className="flex flex-col">
        {/* Main header row */}
        <div className="flex items-center justify-between min-w-0">
          {/* Left side - Avatar and Name */}
          <div className="flex items-center" style={{ width: "fit-content" }}>
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()} // Prevent header expansion when clicking avatar
            >
              <Avatar className="size-8">
                <AvatarImage src="/ognjen.png" alt="Ognjen Adzic" />
                <AvatarFallback>OA</AvatarFallback>
              </Avatar>
              <motion.span
                className="font-medium text-foreground whitespace-nowrap ml-3"
                animate={{
                  opacity: isMobile && isScrolled ? 0 : 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: isMobile && isScrolled ? "none" : "inline",
                }}
              >
                Ognjen Adzic
              </motion.span>
            </Link>
          </div>

          {/* Right side - Navigation Links or Progress Dots */}
          <div className="flex items-center" style={{ width: "fit-content" }}>
            {/* Show either nav links or progress dots, not both */}
            {isMobile && isScrolled ? (
              /* Progress Dots / Minus Icon - Only visible on mobile when scrolled */
              <div className="flex items-center gap-1 px-4 relative">
                {/* Animated dots when collapsed */}
                <motion.div
                  className="flex items-center gap-1"
                  animate={{
                    opacity: isExpanded ? 0 : 1,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: isExpanded ? 0 : 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                      animate={{
                        y: isExpanded ? 0 : [0, -4, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: isExpanded ? 0 : Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>

                {/* Minus Icon when expanded */}
                <motion.div
                  className="w-4 h-0.5 bg-muted-foreground rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scaleX: isExpanded ? 1 : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: isExpanded ? 0.15 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
            ) : (
              /* Navigation Links */
              <motion.nav
                className="flex items-center gap-6 px-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href="/about"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  About
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  Blog
                </Link>
              </motion.nav>
            )}
          </div>
        </div>

        {/* Expanded navigation - Only show on mobile when scrolled and expanded */}
        <motion.div
          className="overflow-hidden"
          animate={{
            height: isMobile && isScrolled && isExpanded ? "auto" : 0,
            opacity: isMobile && isScrolled && isExpanded ? 1 : 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            className="pt-3 pb-1 px-4 border-t border-border/20 mt-2"
            initial={{ y: -10, opacity: 0 }}
            animate={{
              y: isMobile && isScrolled && isExpanded ? 0 : -10,
              opacity: isMobile && isScrolled && isExpanded ? 1 : 0,
            }}
            transition={{
              duration: 0.3,
              delay: isMobile && isScrolled && isExpanded ? 0.1 : 0,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="flex flex-col gap-3">
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                About
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
              >
                Blog
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
