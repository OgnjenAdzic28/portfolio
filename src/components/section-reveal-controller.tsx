import { useLayoutEffect } from "react";

const revealSelector = ".page-reveal-root > *:not(.page-reveal-root)";

function getRevealSpan(target: HTMLElement, childStagger: number) {
  if (target.dataset.sectionReveal !== "children") {
    return childStagger;
  }

  const staggeredChildren = Math.min(Math.max(target.children.length, 1), 3);
  return staggeredChildren * childStagger;
}

export function SectionRevealController() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    ).filter((element) => !element.matches(".home-reveal-root > .hero"));

    for (const target of targets) {
      target.dataset.sectionReveal = target.matches("section")
        ? "children"
        : "self";
    }

    document.documentElement.dataset.sectionRevealReady = "true";

    const compactViewport = window.matchMedia("(max-width: 620px)").matches;
    const childStagger = compactViewport ? 28 : 45;
    const heroSequenceDuration = document.querySelector(".home-reveal-root")
      ? compactViewport
        ? 340
        : 400
      : 0;
    let nextRevealStart = heroSequenceDuration;

    for (const target of targets) {
      target.style.setProperty(
        "--section-reveal-delay",
        `${nextRevealStart}ms`,
      );
      target.dataset.sectionRevealVisible = "true";
      nextRevealStart += getRevealSpan(target, childStagger);
    }
  }, []);

  return null;
}
