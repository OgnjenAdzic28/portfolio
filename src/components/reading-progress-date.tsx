import type { CSSProperties } from "react";

import { PixelSeparator } from "@/components/pixel-separator";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { cn } from "@/lib/utils";

type ReadingProgressDateProps = {
  className?: string;
  dateTime: string;
  formattedDate: string;
  slug: string;
};

function getProgressLabel(progress: number) {
  if (progress > 0) {
    return `${progress}% read`;
  }

  return "Not started";
}

export function ReadingProgressDate({
  className,
  dateTime,
  formattedDate,
  slug,
}: ReadingProgressDateProps) {
  const progress = useReadingProgress(slug);
  const hasStarted = progress > 0;
  const hasFinished = progress >= 100;

  return (
    <span className={cn("reading-progress-date", className)}>
      {hasFinished ? (
        <span className="reading-progress-complete">
          <svg
            aria-hidden="true"
            className="reading-progress-check"
            focusable="false"
            shapeRendering="crispEdges"
            viewBox="0 0 12 12"
          >
            <path
              d="M0 4h2v2H0V4Zm2 2h2v2H2V6Zm2 2h2v2H4V8Zm2-2h2v2H6V6Zm2-2h2v2H8V4Zm2-2h2v2h-2V2Z"
              fill="currentColor"
            />
          </svg>
          <span>Read</span>
        </span>
      ) : hasStarted ? (
        <span
          aria-label={getProgressLabel(progress)}
          className="reading-progress-circle"
          data-progress={progress}
          role="img"
          style={{ "--reading-progress": `${progress}%` } as CSSProperties}
        />
      ) : null}
      {hasStarted ? (
        <PixelSeparator className="reading-progress-separator" />
      ) : null}
      <time dateTime={dateTime}>{formattedDate}</time>
    </span>
  );
}
