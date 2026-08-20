import type { ReactNode } from "react";
import { useLocation } from "react-router";

export function RouteShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="route-shell" key={pathname}>
      {children}
    </div>
  );
}
