"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaXTwitter,
  FaThreads,
  FaLinkedinIn,
  FaInstagram,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useMotionValue } from "motion/react";
import { DockIcon } from "@/components/magicui/dock";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export type IconProps = React.HTMLAttributes<SVGElement>;

// Separator component for the dock
const DockSeparator = () => <div className="h-8 w-px bg-border mx-1" />;

export function SocialDock() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const lastScrollY = useRef(0);
  const mouseX = useMotionValue(Infinity);

  // Define all dock items
  const dockItems = [
    {
      id: "home",
      icon: <FaHome />,
      tooltip: "Home",
      onClick: () => router.push("/"),
      isSpecial: true, // Home button
    },
    {
      id: "twitter",
      icon: <FaXTwitter />,
      tooltip: "Twitter",
      onClick: () => window.open("https://x.com/oginjo28", "_blank"),
      isSpecial: false,
    },
    {
      id: "threads",
      icon: <FaThreads />,
      tooltip: "Threads",
      onClick: () =>
        window.open("https://www.threads.com/@adzicognjen28", "_blank"),
      isSpecial: false,
    },
    {
      id: "instagram",
      icon: <FaInstagram />,
      tooltip: "Instagram",
      onClick: () =>
        window.open("https://www.instagram.com/adzicognjen28/", "_blank"),
      isSpecial: false,
    },
    {
      id: "linkedin",
      icon: <FaLinkedinIn />,
      tooltip: "LinkedIn",
      onClick: () =>
        window.open("https://www.linkedin.com/in/ognjenadzic/", "_blank"),
      isSpecial: false,
    },
    {
      id: "github",
      icon: <FaGithub />,
      tooltip: "GitHub",
      onClick: () => window.open("https://github.com/oginjo28", "_blank"),
      isSpecial: false,
    },
    {
      id: "email",
      icon: <FaEnvelope />,
      tooltip: "Email",
      onClick: () => window.open("mailto:oginjo28@gmail.com", "_blank"),
      isSpecial: false,
    },
    {
      id: "theme",
      icon: mounted ? (
        theme === "dark" ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )
      ) : (
        <Sun size={18} />
      ),
      tooltip: mounted
        ? theme === "dark"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode"
        : "Switch Theme",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
      isSpecial: true, // Theme switcher
    },
  ];

  // Mobile configuration
  const itemsPerPage = 3; // Show 3 items + navigation arrows on mobile for better fit
  const totalPages = Math.ceil(dockItems.length / itemsPerPage);

  // Handle hydration and responsive detection
  useEffect(() => {
    setMounted(true);

    // Set initial visibility based on current scroll position
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY > 100);
    lastScrollY.current = currentScrollY;

    // Check if mobile with throttling for better performance
    let resizeTimeout: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      }, 100); // Throttle resize events
    };

    // Initial check
    setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Handle scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if we're near the bottom of the page (within 100px)
      const isNearBottom =
        currentScrollY + windowHeight >= documentHeight - 100;

      // Show dock when scrolling down, hide when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(false);
      }

      // Always hide at the top of the page
      if (currentScrollY < 100) {
        setIsVisible(false);
      }

      // Hide when near the bottom of the page
      if (isNearBottom) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array - effect only runs once

  // Carousel navigation functions
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Get current page items for mobile carousel
  const getCurrentPageItems = () => {
    if (!isMobile) return dockItems;

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return dockItems.slice(startIndex, endIndex);
  };
  return (
    <motion.div
      className="fixed bottom-8 backdrop-blur-md border rounded-full left-1/2 transform -translate-x-1/2 z-50"
      layout
      initial={{
        y: 100, // Start from -bottom-8 equivalent (32px below)
        scale: 0.8,
        filter: "blur(10px)",
        opacity: 0,
      }}
      animate={{
        y: isVisible ? 0 : 100, // Show/hide based on scroll direction
        scale: isVisible ? 1 : 0.8,
        filter: isVisible ? "blur(0)" : "blur(10px)",
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        delay: mounted ? 0 : 0.2, // Only delay on initial mount
        layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }, // Smooth layout transition
      }}
      style={{
        width: "fit-content",
        height: "fit-content",
        maxWidth: isMobile ? "85vw" : "none",
      }}
    >
      {isMobile ? (
        // Mobile Carousel Layout
        <motion.div
          className="bg-background/60 backdrop-blur-md shadow-2xl rounded-full p-2"
          layout
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "fit-content", height: "fit-content" }}
        >
          <motion.div
            className="flex items-center gap-1"
            layout
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "fit-content" }}
          >
            {/* Previous Button */}
            {totalPages > 1 && (
              <motion.button
                onClick={prevPage}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={14} />
              </motion.button>
            )}

            {/* Current Page Items */}
            <motion.div
              className="flex items-center gap-1"
              key={currentPage}
              layout
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              {getCurrentPageItems().map((item) => (
                <DockIcon
                  key={item.id}
                  className="hover:bg-muted"
                  onClick={item.onClick}
                  tooltipContent={item.tooltip}
                  size={28}
                  magnification={36}
                  distance={60}
                >
                  {item.icon}
                </DockIcon>
              ))}
            </motion.div>

            {/* Next Button */}
            {totalPages > 1 && (
              <motion.button
                onClick={nextPage}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={14} />
              </motion.button>
            )}
          </motion.div>

          {/* Page Indicators */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-1 h-1 rounded-full transition-colors ${
                    index === currentPage
                      ? "bg-foreground"
                      : "bg-muted-foreground/40"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(index)}
                />
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        // Desktop Layout
        <div
          className="backdrop-blur-md rounded-full bg-background/60 shadow-2xl p-2 flex items-center gap-2"
          style={{ width: "fit-content", height: "fit-content" }}
          onMouseMove={(e) => {
            mouseX.set(e.pageX);
          }}
          onMouseLeave={() => {
            mouseX.set(Infinity);
          }}
        >
          {dockItems.map((item) => (
            <div key={item.id} className="flex items-center">
              <DockIcon
                className="hover:bg-muted"
                onClick={item.onClick}
                tooltipContent={item.tooltip}
                size={40}
                magnification={50}
                distance={140}
                mouseX={mouseX}
              >
                {item.icon}
              </DockIcon>
              {/* Add separators after home button and before theme button */}
              {(item.id === "home" || item.id === "email") && <DockSeparator />}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
