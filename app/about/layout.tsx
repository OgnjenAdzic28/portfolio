import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Ognjen Adzic",
  description: "I'm a developer and entrepreneur who builds out of curiosity, frustration, and the need to make things work better. Currently building ALFRED and previously founded Pingless.",
  keywords: [
    "about",
    "developer",
    "entrepreneur", 
    "ALFRED",
    "Pingless",
    "web development",
    "AI agent",
    "desktop apps",
    "startup founder",
    "technology",
    "portfolio"
  ],
  authors: [{ name: "Ognjen Adzic" }],
  creator: "Ognjen Adzic",
  publisher: "Ognjen Adzic",
  openGraph: {
    title: "About - Ognjen Adzic",
    description: "Developer and entrepreneur building ALFRED and previously founded Pingless. Figuring it out as I go.",
    url: "https://ognjen.dev/about",
    siteName: "Ognjen Adzic",
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About - Ognjen Adzic", 
    description: "Developer and entrepreneur building ALFRED and previously founded Pingless. Figuring it out as I go.",
    creator: "@ognjen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://ognjen.dev/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
