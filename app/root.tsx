import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AudioLink } from "@/components/audio-link";
import { RouteShell } from "@/components/route-shell";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import "@/components/writing.module.css";
import { socialLinks } from "@/lib/social-links";
import instrumentSerifLatinExtUrl from "@fontsource/instrument-serif/files/instrument-serif-latin-ext-400-normal.woff2?url";
import instrumentSerifLatinUrl from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url";
import type { Route } from "./+types/root";
import appStylesUrl from "./app.css?url";

const siteUrl = "https://ognjenadzic.com";
const siteName = "Ognjen Adzic";
const description =
  "Ognjen Adzic builds agent workflows and dependable software. He is currently building Invokeable and previously co-founded Pingless and ArchiStella.";
const appStylesHref = appStylesUrl.replace(/\?t=\d+$/, "");
const documentInit =
  "try{var s=localStorage.getItem('ognjen-theme');var t=s==='dark'||s==='light'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}";
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

const missingPageArt = String.raw`
             /\_/\          .--------------------------.
            ( o.o )         | $ find missing-page      |
             > ^ <          | find: no such route      |
            /|   |\         '--------------------------'
           / |___| \              |          |
          /_________\_____________|__________|____
         /                                             \
        /_______________________________________________\
`.trimEnd();

export function loader() {
  return { latestCommit: null };
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
  { rel: "stylesheet", href: appStylesHref },
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

export function ErrorBoundary({ error, loaderData }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (notFound) {
    return (
      <>
        <SiteChrome />
        <div className="route-shell">
          <main className="site-shell not-found-shell">
            <section
              className="not-found-section"
              aria-labelledby="not-found-title"
            >
              <div className="not-found-art" aria-hidden="true">
                <pre>{missingPageArt}</pre>
              </div>

              <div className="not-found-copy">
                <h1 id="not-found-title">this page wandered off.</h1>
                <p>
                  I may have moved it, deleted it, or linked to something that
                  never existed. The URL could also be wrong. Hard to say.
                </p>
                <p>
                  The rest of the site should still be where I left it. If the
                  broken link is mine, find me on{" "}
                  {socialLinks.map((link, index) => (
                    <span className="not-found-social-item" key={link.label}>
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className="not-found-social-separator"
                        >
                          {" / "}
                        </span>
                      ) : null}
                      <AudioLink
                        className="editorial-link"
                        href={link.href}
                        rel={link.href.startsWith("http") ? "me noreferrer" : undefined}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                      >
                        {link.label.slice(0, -1)}
                      </AudioLink>
                    </span>
                  ))}{" "}
                  and tell me what I missed.
                </p>
                <AudioLink
                  className="not-found-home-link site-footer-control"
                  href="/"
                  onClick={(event) => {
                    if (
                      event.defaultPrevented ||
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return;
                    }

                    document.documentElement.dataset.routeTransition =
                      "writing-back";
                    window.setTimeout(() => {
                      delete document.documentElement.dataset.routeTransition;
                    }, 700);
                  }}
                  prefetch="render"
                  pressSound="press"
                  releaseSound="release"
                  sound="home"
                  toggleSound={false}
                  viewTransition
                >
                  Back home
                </AudioLink>
              </div>
            </section>
          </main>
        </div>
        <SiteFooter latestCommit={loaderData?.latestCommit ?? null} />
      </>
    );
  }

  return (
    <>
      <SiteChrome />
      <div className="route-shell">
        <main className="site-shell">
          <section className="hero editorial-section">
            <header className="hero-heading">
              <h1>Error</h1>
              <p className="hero-kicker">Something went wrong.</p>
            </header>
          </section>
        </main>
      </div>
      <SiteFooter latestCommit={loaderData?.latestCommit ?? null} />
    </>
  );
}
