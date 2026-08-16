import type { SVGProps } from "react";

type ThemeMode = "light" | "dark";

type ThemeModeIconProps = SVGProps<SVGSVGElement> & {
  mode: ThemeMode;
  size?: number;
};

const icons = {
  light: {
    viewBox: "0 0 24 24",
    path: "M11 2h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM5 5h2v2H5V5Zm12 12h2v2h-2v-2Zm0-12h2v2h-2V5ZM5 17h2v2H5v-2Zm5-9h4v2h2v4h-2v2h-4v-2H8v-4h2V8Zm0 2v4h4v-4h-4Z",
  },
  dark: {
    viewBox: "0 0 24 24",
    path: "M10 2h6v2h-6V2ZM6 4h10v2H6V4ZM4 6h8v2H4V6ZM2 8h8v8H2V8Zm2 8h8v2H4v-2Zm2 2h10v2H6v-2Zm4 2h8v2h-8v-2Zm9-16h2v2h2v2h-2v2h-2V8h-2V6h2V4Z",
  },
} satisfies Record<ThemeMode, { path: string; viewBox: string }>;

export function ThemeModeIcon({ mode, size = 20, ...props }: ThemeModeIconProps) {
  const icon = icons[mode];

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      shapeRendering="crispEdges"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
