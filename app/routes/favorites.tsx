import { FavoriteCollections } from "@/components/media-shelf";
import { PageBackLink } from "@/components/page-back-link";
import { shelfItems } from "@/lib/shelf";
import type { Route } from "./+types/favorites";

const siteUrl = "https://ognjenadzic.com/favorites";
const description =
  "The books, albums, and films Ognjen Adzic currently counts among his favorites.";

export const meta: Route.MetaFunction = () => [
  { title: "Favorites | Ognjen Adzic" },
  { name: "description", content: description },
  { property: "og:title", content: "Favorites | Ognjen Adzic" },
  { property: "og:description", content: description },
  { property: "og:type", content: "website" },
  { property: "og:url", content: siteUrl },
  { tagName: "link", rel: "canonical", href: siteUrl },
];

export function headers() {
  return {
    "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
  };
}

export default function FavoritesPage() {
  return (
    <main className="site-shell favorites-page page-reveal-root" id="top">
      <PageBackLink />

      <header className="favorites-page-intro">
        <h1>favorites</h1>
        <p>
          A running list of books, records, and films I keep coming back to, or
          just do not want to forget. It changes when I do.
        </p>
      </header>

      <FavoriteCollections items={shelfItems} />
    </main>
  );
}
