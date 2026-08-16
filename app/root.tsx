import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { RouteShell } from "@/components/route-shell";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { getLatestPortfolioCommit } from "@/lib/github-latest-commit.server";
import instrumentSerifLatinExtUrl from "@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-normal.woff2?url";
import instrumentSerifLatinUrl from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url";
import type { Route } from "./+types/root";
import "./app.css";

const siteUrl = "https://ognjenadzic.com";
const siteName = "Ognjen Adzic";
const description =
  "Ognjen Adzic builds agent workflows and dependable software. He is currently building Invokeable and previously co-founded Pingless and ArchiStella.";
const documentInit =
  "try{var s=localStorage.getItem('ognjen-theme');var t=s==='dark'||s==='light'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.sectionRevealEnabled='true';setTimeout(function(){if(!document.documentElement.dataset.sectionRevealReady){delete document.documentElement.dataset.sectionRevealEnabled}},2500)}}catch(e){}";
const instrumentSerifFontFaces = `
@font-face {
  font-family: "Instrument Serif";
  font-style: normal;
  font-display: block;
  font-weight: 400;
  src: url("${instrumentSerifLatinExtUrl}") format("woff2");
  unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face {
  font-family: "Instrument Serif";
  font-style: normal;
  font-display: block;
  font-weight: 400;
  src: url("${instrumentSerifLatinUrl}") format("woff2");
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}`;

export async function loader() {
  return { latestCommit: await getLatestPortfolioCommit() };
}

export const meta: Route.MetaFunction = () => [
  { title: siteName },
  { name: "description", content: description },
  { name: "application-name", content: siteName },
  { name: "author", content: siteName },
  {
    name: "keywords",
    content: "Ognjen Adzic, AI agents, Invokeable, Pingless, ArchiStella",
  },
  { property: "og:title", content: siteName },
  { property: "og:description", content: description },
  { property: "og:url", content: siteUrl },
  { property: "og:site_name", content: siteName },
  { property: "og:type", content: "website" },
  { property: "og:image", content: `${siteUrl}/og-image.jpg` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: siteName },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: siteName },
  { name: "twitter:description", content: description },
  { name: "twitter:creator", content: "@OgnjenAdzic" },
  { name: "twitter:image", content: `${siteUrl}/og-image.jpg` },
  { tagName: "link", rel: "canonical", href: siteUrl },
];

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", sizes: "16x16 32x32 48x48" },
  { rel: "icon", href: "/portfolio-icon.png", type: "image/png" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
  {
    rel: "preload",
    href: instrumentSerifLatinUrl,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: instrumentSerifFontFaces }} />
        <script dangerouslySetInnerHTML={{ __html: documentInit }} />
      </head>
      <body className="min-h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <SiteChrome />
      <RouteShell>
        <Outlet />
      </RouteShell>
      <SiteFooter latestCommit={loaderData.latestCommit} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const message = notFound ? "That page is not here." : "Something went wrong.";

  return (
    <main className="site-shell page-reveal-root">
      <section className="hero editorial-section">
        <header className="hero-heading">
          <h1>{notFound ? "404" : "Error"}</h1>
          <p className="hero-kicker">{message}</p>
        </header>
      </section>
    </main>
  );
}
