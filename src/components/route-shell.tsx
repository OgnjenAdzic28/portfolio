import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { SectionRevealController } from "@/components/section-reveal-controller";

export function RouteShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="route-shell" key={pathname}>
      <SectionRevealController />
      {children}
    </div>
  );
}
