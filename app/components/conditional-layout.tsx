"use client";

import { usePathname } from "next/navigation";
import { SocialDock } from "@/components/social-dock";
import Header from "./nav/Header";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Don't show header and social dock on Keystatic admin pages
  const isKeystatic = pathname.startsWith("/keystatic");

  if (isKeystatic) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <SocialDock />
    </>
  );
}
