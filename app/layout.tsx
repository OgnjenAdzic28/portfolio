import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import ConditionalLayout from "./components/conditional-layout";
import SmoothScroll from "./components/smooth-scroll";
import { ThemeProvider } from "./components/theme/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--color-muted) var(--color-background)",
      }}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalLayout>
            <SmoothScroll>{children}</SmoothScroll>
          </ConditionalLayout>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
