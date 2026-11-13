import type { ReactNode } from "react";
import { AudioLink } from "@/components/audio-link";

type SectionViewAllProps = {
  children: ReactNode;
  href: string;
  external?: boolean;
};

export function SectionViewAll({
  children,
  href,
  external,
}: SectionViewAllProps) {
  return (
    <AudioLink
      className="section-view-all"
      href={href}
      {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
    >
      {children}
      <svg
        aria-hidden="true"
        className="section-view-all-icon"
        fill="currentColor"
        shapeRendering="crispEdges"
        viewBox="0 0 16 16"
      >
        <path d="M8 2h6v6h-2V4H8V2Zm1 2h3v2H9V4ZM7 6h3v2H7V6ZM5 8h3v2H5V8Zm-2 2h3v3H3v-3Z" />
      </svg>
    </AudioLink>
  );
}
