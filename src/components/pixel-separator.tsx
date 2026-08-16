import { cn } from "@/lib/utils";

export function PixelSeparator({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pixel-separator", className)}
      focusable="false"
      height="18"
      shapeRendering="crispEdges"
      viewBox="0 0 12 18"
      width="12"
    >
      <path
        d="M10 0h2v3h-2V0ZM8 3h2v3H8V3ZM6 6h2v3H6V6ZM4 9h2v3H4V9Zm-2 3h2v3H2v-3Zm-2 3h2v3H0v-3Z"
        fill="currentColor"
      />
    </svg>
  );
}
