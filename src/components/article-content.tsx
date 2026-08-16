import { useEffect, useRef } from "react";

export function ArticleContent({ html }: { html: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.querySelectorAll("a").forEach((link) => {
      link.dataset.cuelumeHover = "release";
      link.dataset.cuelumeToggle = "sparkle";
    });
  }, [html]);

  return (
    <div
      ref={rootRef}
      className="article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
