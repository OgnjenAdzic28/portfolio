import NumberFlow from "@number-flow/react";
import { bind, setVolume } from "cuelume";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { AudioLink } from "@/components/audio-link";
import { PixelSeparator } from "@/components/pixel-separator";
import { ProgressiveBlur } from "@/components/ui/skiper-ui/skiper41";
import {
  getReadingProgressState,
  saveReadingProgress,
} from "@/lib/reading-progress";

type ScrollState = {
  canScroll: boolean;
  footerRevealed: boolean;
  hasScrolled: boolean;
  indicatorOffset: number;
  progress: number;
};

const initialScrollState: ScrollState = {
  canScroll: false,
  footerRevealed: false,
  hasScrolled: false,
  indicatorOffset: 0,
  progress: 0,
};
const rulerTicks = Array.from({ length: 101 }, (_, index) => index);
const scrollIndicatorViewportInsetRatio = 0.18;
const scrollIndicatorContentGap = 40;
const activeNavLinkStyle = {
  color: "var(--foreground)",
  textDecoration: "none",
} satisfies CSSProperties;
const activeNavDotStyle = {
  width: 3,
  height: 3,
  flex: "0 0 3px",
  marginRight: 5,
  borderRadius: "50%",
  background: "currentColor",
} satisfies CSSProperties;

function ActiveNavDot() {
  return <span aria-hidden="true" data-active-nav-dot style={activeNavDotStyle} />;
}

function getArticleSlug(pathname: string) {
  const encodedSlug = pathname.match(/^\/writing\/([^/]+)\/?$/)?.[1];

  if (!encodedSlug) {
    return null;
  }

  try {
    return decodeURIComponent(encodedSlug);
  } catch {
    return encodedSlug;
  }
}

function getArticleScrollRange(article: HTMLElement) {
  return Math.max(
    0,
    window.scrollY + article.getBoundingClientRect().bottom - window.innerHeight,
  );
}

function getCurrentArticleProgress() {
  const article = document.querySelector<HTMLElement>(".article");

  if (!article) {
    return 0;
  }

  const scrollRange = getArticleScrollRange(article);

  return scrollRange <= 0
    ? 100
    : Math.min(100, Math.max(0, (window.scrollY / scrollRange) * 100));
}

function navigateToArticleProgress(progress: number) {
  const article = document.querySelector<HTMLElement>(".article");

  if (!article) {
    return;
  }

  const boundedProgress = Math.min(100, Math.max(0, progress));
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const targetScroll = Math.min(
    maxScroll,
    getArticleScrollRange(article) * (boundedProgress / 100),
  );

  window.scrollTo(0, targetScroll);
}

export function SiteChrome() {
  const { pathname } = useLocation();
  const [activeHash, setActiveHash] = useState("");
  const [compactViewport, setCompactViewport] = useState(false);
  const [scrollState, setScrollState] = useState(initialScrollState);
  const savedReadingStateRef = useRef({ furthest: 0, position: 0 });
  const articleSlug = getArticleSlug(pathname);
  const showScrollIndicator = articleSlug !== null && !compactViewport;
  const wroteIsActive =
    pathname === "/writing" || pathname.startsWith("/writing/");
  const builtIsActive = pathname === "/" && activeHash === "#work";
  const committedIsActive =
    pathname === "/" && activeHash === "#contributions";
  const likedIsActive =
    pathname === "/favorites" || pathname.startsWith("/favorites/");

  useEffect(() => {
    const compactViewportQuery = window.matchMedia("(max-width: 620px)");
    const syncCompactViewport = () => {
      setCompactViewport(compactViewportQuery.matches);
    };

    syncCompactViewport();
    compactViewportQuery.addEventListener("change", syncCompactViewport);

    return () => {
      compactViewportQuery.removeEventListener("change", syncCompactViewport);
    };
  }, []);

  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  useEffect(() => {
    try {
      bind();
      setVolume(0.52);
    } catch {
      // Audio is optional and must not prevent navigation or scroll chrome.
    }
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let hasRestoredReadingPosition = articleSlug === null;
    savedReadingStateRef.current = articleSlug
      ? getReadingProgressState(articleSlug)
      : { furthest: 0, position: 0 };

    const measure = () => {
      animationFrame = 0;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollY = Math.max(0, window.scrollY);
      const canScroll = maxScroll > 1;
      const article = articleSlug
        ? document.querySelector<HTMLElement>(".article")
        : null;
      const articleBottomScroll = article
        ? scrollY + article.getBoundingClientRect().bottom - window.innerHeight
        : 0;

      if (articleSlug && article && !hasRestoredReadingPosition) {
        hasRestoredReadingPosition = true;
        const savedPosition = savedReadingStateRef.current.position;
        const resumePosition = savedPosition >= 99 ? 0 : savedPosition;
        const restoredScrollY = Math.min(
          maxScroll,
          Math.max(
            0,
            articleBottomScroll *
              (resumePosition / 100),
          ),
        );

        if (Math.abs(scrollY - restoredScrollY) > 1) {
          window.scrollTo(0, restoredScrollY);
          animationFrame = window.requestAnimationFrame(measure);
          return;
        }
      }

      const primaryHeading = document.querySelector<HTMLElement>("main h1");
      const routeShell = document.querySelector<HTMLElement>(".route-shell");
      const footer = document.querySelector<HTMLElement>(".site-footer");
      const routeBottom = routeShell?.getBoundingClientRect().bottom;
      // The sticky footer sits under the route from page load, so the route edge
      // is the reliable signal for the first visible sliver of the footer.
      const footerRevealDepth = routeBottom === undefined
        ? 0
        : window.innerHeight - routeBottom;
      const footerRevealProgress = footer
        ? Math.min(
            1,
            Math.max(0, footerRevealDepth / footer.getBoundingClientRect().height),
          )
        : 0;

      // Geometry drives both directions, so the same reveal depth has the same opacity.
      footer?.style.setProperty(
        "--footer-content-opacity",
        footerRevealProgress.toFixed(4),
      );

      const pageProgress = canScroll
        ? Math.min(1, scrollY / maxScroll) * 100
        : 0;
      const readingProgress = article
        ? articleBottomScroll <= 0
          ? 100
          : Math.min(1, scrollY / articleBottomScroll) * 100
        : pageProgress;

      if (articleSlug && article) {
        const currentPosition =
          readingProgress >= 99
            ? 100
            : Math.min(100, Math.max(0, Math.round(readingProgress)));

        if (currentPosition !== savedReadingStateRef.current.position) {
          savedReadingStateRef.current = saveReadingProgress(
            articleSlug,
            currentPosition,
          );
        }
      }

      // Keep the full ruler fixed until its bottom reaches the route edge,
      // then move it with the route while preserving the content gap.
      const indicatorOffset =
        compactViewport || routeBottom === undefined
          ? 0
          : Math.min(
              0,
              routeBottom -
                scrollIndicatorContentGap -
                window.innerHeight * (1 - scrollIndicatorViewportInsetRatio),
            );
      const nextState = {
        canScroll,
        footerRevealed: footerRevealDepth > 0,
        hasScrolled: primaryHeading
          ? primaryHeading.getBoundingClientRect().bottom <= 0
          : scrollY > 24,
        indicatorOffset,
        progress: compactViewport ? 0 : readingProgress,
      };
      setScrollState((currentState) =>
        currentState.canScroll === nextState.canScroll &&
        currentState.footerRevealed === nextState.footerRevealed &&
        currentState.hasScrolled === nextState.hasScrolled &&
        currentState.indicatorOffset === nextState.indicatorOffset &&
        currentState.progress === nextState.progress
          ? currentState
          : nextState,
      );
    };

    const requestMeasure = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(measure);
      }
    };

    const resizeObserver = new ResizeObserver(requestMeasure);

    resizeObserver.observe(document.documentElement);
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);
    requestMeasure();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);

      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [articleSlug, compactViewport]);

  const navigateFromPointer = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const progress = ((event.clientY - bounds.top) / bounds.height) * 100;

    navigateToArticleProgress(progress);
  };

  const handleIndicatorPointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.button !== 0 || !scrollState.canScroll) {
      return;
    }

    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    navigateFromPointer(event);
  };

  const handleIndicatorPointerMove = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      navigateFromPointer(event);
    }
  };

  const handleIndicatorPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    navigateFromPointer(event);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleIndicatorPointerCancel = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleIndicatorKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const currentProgress = getCurrentArticleProgress();
    let nextProgress: number;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextProgress = currentProgress + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextProgress = currentProgress - 1;
        break;
      case "PageDown":
        nextProgress = currentProgress + 10;
        break;
      case "PageUp":
        nextProgress = currentProgress - 10;
        break;
      case "Home":
        nextProgress = 0;
        break;
      case "End":
        nextProgress = 100;
        break;
      default:
        return;
    }

    event.preventDefault();
    navigateToArticleProgress(nextProgress);
  };

  const progressStyle = {
    "--scroll-indicator-offset": `${scrollState.indicatorOffset}px`,
    "--scroll-progress": `${scrollState.progress}%`,
  } as CSSProperties;

  return (
    <>
      {scrollState.hasScrolled ? (
        <div
          className="viewport-progressive-blur top-progressive-blur"
          aria-hidden="true"
        >
          <ProgressiveBlur
            backgroundColor="var(--background)"
            blurAmount="16px"
            height="96px"
            position="top"
          />
        </div>
      ) : null}

      <header
        className="site-header"
        data-visible={scrollState.hasScrolled}
        aria-hidden={!scrollState.hasScrolled}
        inert={scrollState.hasScrolled ? undefined : true}
      >
        <nav className="site-header-nav" aria-label="Primary navigation">
          <AudioLink
            className="site-wordmark"
            href="/"
            onClick={() => {
              setActiveHash("");
            }}
            sound="home"
          >
            Ognjen
          </AudioLink>
          <span className="navigation-links" style={{ textTransform: "none" }}>
            <AudioLink
              aria-current={wroteIsActive ? "page" : undefined}
              href="/writing"
              style={wroteIsActive ? activeNavLinkStyle : undefined}
            >
              {wroteIsActive ? <ActiveNavDot /> : null}
              Wrote
            </AudioLink>
            <PixelSeparator />
            <AudioLink
              aria-current={builtIsActive ? "location" : undefined}
              href="/#work"
              onClick={() => {
                setActiveHash("#work");
              }}
              style={builtIsActive ? activeNavLinkStyle : undefined}
            >
              {builtIsActive ? <ActiveNavDot /> : null}
              Built
            </AudioLink>
            <PixelSeparator />
            <AudioLink
              aria-current={committedIsActive ? "location" : undefined}
              href="/#contributions"
              onClick={() => {
                setActiveHash("#contributions");
              }}
              style={committedIsActive ? activeNavLinkStyle : undefined}
            >
              {committedIsActive ? <ActiveNavDot /> : null}
              Committed
            </AudioLink>
            <PixelSeparator />
            <AudioLink
              aria-current={likedIsActive ? "page" : undefined}
              href="/favorites"
              style={likedIsActive ? activeNavLinkStyle : undefined}
            >
              {likedIsActive ? <ActiveNavDot /> : null}
              Liked
            </AudioLink>
          </span>
        </nav>
      </header>

      <div
        className="viewport-progressive-blur bottom-progressive-blur"
        data-visible={!scrollState.footerRevealed}
        aria-hidden="true"
      >
        <ProgressiveBlur
          backgroundColor="var(--background)"
          blurAmount="16px"
          height="96px"
          position="bottom"
        />
      </div>

      {showScrollIndicator ? (
        <aside
          aria-disabled={!scrollState.canScroll}
          aria-label="Reading progress"
          aria-orientation="vertical"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(scrollState.progress)}
          aria-valuetext={`${Math.round(scrollState.progress)}% read`}
          className="scroll-indicator"
          data-visible={scrollState.canScroll}
          onKeyDown={handleIndicatorKeyDown}
          onPointerCancel={handleIndicatorPointerCancel}
          onPointerDown={handleIndicatorPointerDown}
          onPointerMove={handleIndicatorPointerMove}
          onPointerUp={handleIndicatorPointerUp}
          role="slider"
          style={progressStyle}
          tabIndex={scrollState.canScroll ? 0 : -1}
        >
          <span className="scroll-ruler" aria-hidden="true">
            {rulerTicks.map((tick) => (
              <span
                className="scroll-ruler-tick"
                data-emphasis={
                  tick % 10 === 0 ? "major" : tick % 5 === 0 ? "mid" : "minor"
                }
                key={tick}
              />
            ))}
          </span>
          <span className="scroll-progress-active" aria-hidden="true">
            <NumberFlow
              className="scroll-progress-number"
              value={Math.round(scrollState.progress)}
              suffix="%"
              format={{ maximumFractionDigits: 0, useGrouping: false }}
              willChange
            />
            <span className="scroll-progress-active-tick" />
          </span>
        </aside>
      ) : null}

    </>
  );
}
