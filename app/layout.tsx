import "./globals.css";
import { ThemeProvider } from "./components/theme/theme-provider";
import SmoothScroll from "./components/smooth-scroll";
import ConditionalLayout from "./components/conditional-layout";

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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalLayout>
            <SmoothScroll>{children}</SmoothScroll>
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
