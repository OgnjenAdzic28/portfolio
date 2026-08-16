import { useEffect, useRef } from "react";
import { AudioLink } from "@/components/audio-link";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.matches("input, textarea, select") ||
      Boolean(target.closest('[contenteditable="true"]')))
  );
}

type PageBackLinkProps = {
  ariaLabel?: string;
  href?: string;
  label?: string;
};

export function PageBackLink({
  ariaLabel = "Back to home",
  href = "/",
  label = "Back",
}: PageBackLinkProps = {}) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.key !== "[" ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      linkRef.current?.click();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Tooltip
      content={
        <span className="flex items-center gap-2">
          Back <Kbd>[</Kbd>
        </span>
      }
      sideOffset={10}
    >
      <AudioLink
        ref={linkRef}
        aria-keyshortcuts="["
        aria-label={ariaLabel}
        className="page-back-link"
        href={href}
        sound="home"
      >
        <svg
          aria-hidden="true"
          className="page-back-link-icon"
          fill="currentColor"
          shapeRendering="crispEdges"
          viewBox="0 0 16 16"
        >
          <path d="M6 2h2v2H6V2ZM4 4h2v2H4V4ZM2 6h2v4H2V6Zm2 1h10v2H4V7Zm0 3h2v2H4v-2Zm2 2h2v2H6v-2Z" />
        </svg>
        <span>{label}</span>
      </AudioLink>
    </Tooltip>
  );
}
