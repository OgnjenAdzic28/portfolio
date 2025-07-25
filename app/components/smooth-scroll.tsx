"use client";

import Lenis from "lenis";
import { useCallback, useEffect, useRef } from "react";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const raf = useCallback((time: number) => {
    if (lenisRef.current) {
      lenisRef.current.raf(time);
    }
    rafRef.current = requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 1.2, // Animation duration in seconds
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), // Custom easing function for smooth deceleration
      touchMultiplier: 2, // Touch sensitivity
      infinite: false, // Disable infinite scroll
    });

    lenisRef.current = lenis;

    // Start the animation loop
    rafRef.current = requestAnimationFrame(raf);

    // Handle anchor links and smooth scrolling to elements
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;

      if (anchor?.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(
          anchor.hash
        ) as HTMLElement;
        if (targetElement) {
          lenis.scrollTo(targetElement, {
            offset: -100, // Offset for fixed headers
            duration: 1.5,
          });
        }
      }
    };

    // Add event listener for anchor links
    document.addEventListener("click", handleAnchorClick);

    // Expose lenis instance for external control
    (window as typeof window & { lenis: Lenis }).lenis = lenis;

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      delete (window as typeof window & { lenis?: Lenis }).lenis;
    };
  }, [raf]);

  // Handle page visibility changes to pause/resume animation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (lenisRef.current) {
        if (document.hidden) {
          // Pause animation when page is hidden
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        } else {
          // Resume animation when page becomes visible
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(raf);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [raf]);

  return <>{children}</>;
}
