"use client";

import type { FocusEvent, PointerEvent } from "react";
import { playHoverTone } from "@/components/audio-link";

function getLink(target: EventTarget | null) {
  return target instanceof Element ? target.closest("a") : null;
}

export function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="article-body"
      onPointerOver={(event: PointerEvent<HTMLDivElement>) => {
        const link = getLink(event.target);
        const previousLink = getLink(event.relatedTarget);

        if (link && link !== previousLink) {
          playHoverTone("accent");
        }
      }}
      onFocusCapture={(event: FocusEvent<HTMLDivElement>) => {
        if (getLink(event.target)) {
          playHoverTone("accent");
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
