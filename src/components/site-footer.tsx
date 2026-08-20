import { useEffect, useRef, useState } from "react";
import { AudioLink } from "@/components/audio-link";
import { AudioToggle } from "@/components/audio-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { socialLinks } from "@/lib/social-links";
import type { LatestPortfolioCommit } from "@/lib/github-latest-commit.server";

type LatestCommitData = LatestPortfolioCommit;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLatestCommitData(value: unknown): value is LatestCommitData {
  return (
    isRecord(value) &&
    typeof value.additions === "number" &&
    typeof value.committedAt === "string" &&
    typeof value.deletions === "number" &&
    typeof value.sha === "string" &&
    typeof value.url === "string"
  );
}

function CommitIcon() {
  return (
    <svg
      aria-hidden="true"
      className="site-footer-commit-icon"
      fill="currentColor"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 24 24"
    >
      <path d="M20 20H4v-2h16v2ZM4 18H2V6h2v12Zm18 0h-2V6h2v12ZM8 16H6v-2h2v2Zm2-2H8v-2h2v2Zm-2-2H6v-2h2v2Zm12-6H4V4h16v2Z" />
    </svg>
  );
}

function OASignature() {
  return (
    <svg
      aria-label="Ognjen Adzic"
      className="site-footer-signature"
      fill="none"
      focusable="false"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 400 180"
    >
      <path
        d="M147 15c7 0 13 4 18 9-22-4-48-1-60 10-14 14-14 45-9 70 5 28 24 43 48 42 27-1 41-20 41-48 0-30-9-57-20-74"
        strokeWidth="4.4"
      />
      <path
        d="M112 169c26-50 57-109 86-159"
        strokeWidth="4.2"
      />
      <path
        d="M145 122c23-42 48-88 66-102 9-7 14-2 12 20-2 22-12 70-7 83 4 13 15 8 28-4 12-12 19-27 21-42"
        strokeWidth="4"
      />
      <path
        d="M18 123c72-33 151-53 245-46-3 18-43 26-103 31-58 6-105 13-142 15Z"
        strokeWidth="3.8"
      />
      <path
        d="M181 103c69 2 139-13 199-30"
        strokeWidth="3.8"
      />
    </svg>
  );
}

function formatRelativeTime(value: string) {
  const elapsed = Math.max(0, Date.now() - Date.parse(value));
  const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (elapsed < minute) {
    return "just now";
  }

  if (elapsed < hour) {
    return relativeTime.format(-Math.max(1, Math.round(elapsed / minute)), "minute");
  }

  if (elapsed < day) {
    return relativeTime.format(-Math.max(1, Math.round(elapsed / hour)), "hour");
  }

  if (elapsed < 30 * day) {
    return relativeTime.format(-Math.max(1, Math.round(elapsed / day)), "day");
  }

  if (elapsed < 365 * day) {
    return relativeTime.format(-Math.max(1, Math.round(elapsed / (30 * day))), "month");
  }

  return relativeTime.format(-Math.max(1, Math.round(elapsed / (365 * day))), "year");
}

function formatCommitDateTitle(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

function LatestCommit({ commit }: { commit: LatestCommitData | null }) {
  if (!commit) {
    return (
      <p className="site-footer-commit">
        <CommitIcon />
        <span>last Portfolio commit unavailable</span>
      </p>
    );
  }

  const relativeTime = formatRelativeTime(commit.committedAt);

  return (
    <AudioLink
      aria-label={`Last Portfolio commit ${relativeTime}: ${commit.additions} additions and ${commit.deletions} deletions`}
      className="site-footer-commit"
      href={commit.url}
      rel="noreferrer"
      target="_blank"
      title={`Open commit ${commit.sha.slice(0, 7)}`}
    >
      <CommitIcon />
      <span>last Portfolio commit</span>
      <time
        dateTime={commit.committedAt}
        title={formatCommitDateTitle(commit.committedAt)}
      >
        {relativeTime}
      </time>
      <span aria-hidden="true">:</span>
      <span className="site-footer-commit-additions" aria-hidden="true">
        +{commit.additions}
      </span>
      <span className="site-footer-commit-deletions" aria-hidden="true">
        -{commit.deletions}
      </span>
    </AudioLink>
  );
}

export function SiteFooter({
  latestCommit,
}: {
  latestCommit: LatestCommitData | null;
}) {
  const year = new Date().getFullYear();
  const [resolvedCommit, setResolvedCommit] = useState(latestCommit);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (latestCommit) {
      return;
    }

    const footer = footerRef.current;

    if (!footer) {
      return;
    }

    let controller: AbortController | null = null;
    let requested = false;
    const loadWhenRevealed = () => {
      const routeBottom = document
        .querySelector<HTMLElement>(".route-shell")
        ?.getBoundingClientRect().bottom;

      if (requested || routeBottom === undefined || routeBottom >= window.innerHeight) {
        return;
      }

      requested = true;
      window.removeEventListener("scroll", loadWhenRevealed);
      controller = new AbortController();

      void fetch("/resources/site-data", {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((value: unknown) => {
          if (isRecord(value) && isLatestCommitData(value.latestCommit)) {
            setResolvedCommit(value.latestCommit);
          }
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            console.error("Unable to refresh the latest Portfolio commit", error);
          }
        });
    };

    window.addEventListener("scroll", loadWhenRevealed, { passive: true });
    loadWhenRevealed();

    return () => {
      window.removeEventListener("scroll", loadWhenRevealed);
      controller?.abort();
    };
  }, [latestCommit]);

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="site-footer-noise" aria-hidden="true" />
      <svg className="site-footer-noise-defs" aria-hidden="true">
        <filter id="site-footer-noise-filter">
          <feTurbulence
            baseFrequency="0.85"
            numOctaves="3"
            result="noise"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feColorMatrix result="mono" type="saturate" values="0" />
          <feComponentTransfer result="contrast">
            <feFuncR intercept="-0.2" slope="1.4" type="linear" />
            <feFuncG intercept="-0.2" slope="1.4" type="linear" />
            <feFuncB intercept="-0.2" slope="1.4" type="linear" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div className="site-footer-inner">
        <header className="site-footer-head">
          <AudioLink className="site-footer-wordmark" href="/#top" sound="home">
            Ognjen
          </AudioLink>
          <TooltipProvider>
            <div
              className="site-footer-controls"
              aria-label="Site preferences"
              role="group"
            >
              <AudioToggle />
              <ThemeToggle />
            </div>
          </TooltipProvider>
        </header>

        <section className="site-footer-body">
          <nav aria-label="Elsewhere" className="site-footer-links">
            <ul>
              {socialLinks.map((link) => (
                <li className="site-footer-link-row" key={link.label}>
                  <AudioLink
                    className="site-footer-link"
                    href={link.href}
                    hoverSound="whisper"
                    rel={link.href.startsWith("http") ? "me noreferrer" : undefined}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                  >
                    {link.label}
                  </AudioLink>
                  <span
                    className="site-footer-link-note"
                    data-cuelume-hover="whisper"
                  >
                    {link.note}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <aside className="site-footer-note" aria-labelledby="footer-note-title">
            <h2 id="footer-note-title">you made it to the bottom</h2>
            <p>
              I keep changing this site whenever I learn something or spot a
              detail I somehow missed for a week. It will probably look a little
              different next time.
            </p>
            <p className="site-footer-signoff">
              thanks for looking around,
              <OASignature />
            </p>
            <p className="site-footer-postscript">
              <i>P.S. the code is public if you want to see how it works.</i>
            </p>
          </aside>
        </section>

        <div className="site-footer-bottom">
          <LatestCommit commit={resolvedCommit} />

          <small className="site-footer-meta">
            <span>
              © <time>{year}</time> Ognjen
            </span>
            <span aria-hidden="true">|</span>
            <AudioLink
              href="https://github.com/OgnjenAdzic28/portfolio"
              rel="noreferrer"
              target="_blank"
            >
              view source
            </AudioLink>
          </small>
        </div>
      </div>
    </footer>
  );
}
