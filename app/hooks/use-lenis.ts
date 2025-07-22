'use client';

import { useEffect, useState } from 'react';
import type Lenis from 'lenis';

/**
 * Hook to access the global Lenis instance
 * @returns Lenis instance or null if not initialized
 */
export function useLenis() {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const checkLenis = () => {
      const lenisInstance = (window as typeof window & { lenis?: Lenis }).lenis;
      if (lenisInstance) {
        setLenis(lenisInstance);
      }
    };

    // Check immediately
    checkLenis();

    // Check periodically until Lenis is available
    const interval = setInterval(() => {
      if (!lenis) {
        checkLenis();
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lenis]);

  return lenis;
}

/**
 * Hook to scroll to a specific element or position
 * @returns scrollTo function
 */
export function useScrollTo() {
  const lenis = useLenis();

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
    }
  ) => {
    if (lenis) {
      lenis.scrollTo(target, options);
    }
  };

  return scrollTo;
}
