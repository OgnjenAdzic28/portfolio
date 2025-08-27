import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Ognjen Adzic",
  description:
    "Thoughts on building tools, entrepreneurship, and figuring things out as I go. Read about my journey with PennyOne, Pingless, and other projects.",
  keywords: [
    "blog",
    "development",
    "entrepreneurship",
    "PennyOne",
    "Pingless",
    "web development",
    "AI",
    "desktop apps",
    "startup",
    "technology",
  ],
  authors: [{ name: "Ognjen Adzic" }],
  creator: "Ognjen Adzic",
  publisher: "Ognjen Adzic",
  openGraph: {
    title: "Blog - Ognjen Adzic",
    description:
      "Thoughts on building tools, entrepreneurship, and figuring things out as I go.",
    url: "https://ognjen.dev/blog",
    siteName: "Ognjen Adzic",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Ognjen Adzic",
    description:
      "Thoughts on building tools, entrepreneurship, and figuring things out as I go.",
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
    canonical: "https://ognjen.dev/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
