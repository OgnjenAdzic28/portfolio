import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from "react";
import { AudioLink } from "@/components/audio-link";
import { Card17 } from "@/components/beste/component/card17";
import { Card19 } from "@/components/beste/component/card19";
import { ShelfCoverInteraction } from "@/components/shelf-cover-interaction";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ShelfItem, ShelfKind, ShelfRating } from "@/lib/shelf";
import { shelfSections } from "@/lib/shelf";

const kindLabels: Record<ShelfKind, string> = {
  album: "music",
  book: "book",
  movie: "movie",
};

const ratingSteps = [1, 2, 3, 4, 5] as const;

type PixelRatingStarStyle = CSSProperties & {
  "--rating-fill": string;
};

type ShelfLinkProps = ComponentPropsWithoutRef<"a"> & {
  children: ReactNode;
};

function ShelfLink({ children, ...props }: ShelfLinkProps) {
  return <AudioLink {...props}>{children}</AudioLink>;
}

function getRating(item: ShelfItem): ShelfRating {
  return item.rating ?? 5;
}

function getShelfLinkLabel(item: ShelfItem, includeRating = true) {
  const label = `Open ${item.title} by ${item.creator}`;
  return includeRating
    ? `${label}, rated ${getRating(item)} out of 5`
    : label;
}

function PixelRating({ rating }: { rating: ShelfRating }) {
  return (
    <span
      aria-hidden="true"
      className="pixel-rating"
      data-rating={rating}
      title={`${rating} out of 5 stars`}
    >
      {ratingSteps.map((step) => {
        const fillAmount = Math.min(1, Math.max(0, rating - step + 1));
        const style: PixelRatingStarStyle = {
          "--rating-fill": `${fillAmount * 100}%`,
        };

        return (
          <span
            className="pixel-rating-star"
            data-fill={
              fillAmount === 1 ? "full" : fillAmount === 0 ? "empty" : "half"
            }
            data-filled={fillAmount > 0}
            key={step}
            style={style}
          />
        );
      })}
    </span>
  );
}

function ShelfArtwork({ item }: { item: ShelfItem }) {
  return (
    <span className={`shelf-artwork shelf-artwork-${item.kind}`}>
      <ShelfCoverInteraction>
        {item.kind === "album" ? (
          <Card17 artist={item.creator} src={item.image} title={item.title} />
        ) : item.kind === "book" ? (
          <Card19 author={item.creator} src={item.image} title={item.title} />
        ) : (
          <span className="shelf-movie-cover">
            <img
              alt=""
              className="absolute inset-0 size-full object-cover"
              decoding="async"
              loading="lazy"
              src={item.image}
            />
            <span aria-hidden="true" className="shelf-movie-cover-outline" />
          </span>
        )}
      </ShelfCoverInteraction>
    </span>
  );
}

function ShelfMeta({ item }: { item: ShelfItem }) {
  return (
    <span className="shelf-item-meta">
      <span>{item.creator}</span>
      <span aria-hidden="true">·</span>
      <span>{item.year}</span>
    </span>
  );
}

export function MediaShelf({ items }: { items: readonly ShelfItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="editorial-section" id="favorites">
      <header className="section-heading shelf-preview-heading">
        <span>
          <h2>Things I like</h2>
          <p>
            A small mix of books, records, and films I keep coming back to.
            The rest are on my favorites page.
          </p>
        </span>
        <AudioLink className="shelf-view-all" href="/favorites">
          Browse all favorites
          <svg
            aria-hidden="true"
            className="shelf-view-all-icon"
            fill="currentColor"
            shapeRendering="crispEdges"
            viewBox="0 0 16 16"
          >
            <path d="M8 2h6v6h-2V4H8V2Zm1 2h3v2H9V4ZM7 6h3v2H7V6ZM5 8h3v2H5V8Zm-2 2h3v3H3v-3Z" />
          </svg>
        </AudioLink>
      </header>

      <ul aria-label="A few things I like" className="wide-bleed taste-grid">
        {items.map((item) => (
          <li className="taste-grid-item" key={item.id}>
            <ShelfLink
              aria-label={getShelfLinkLabel(item, false)}
              className={`taste-card taste-card-${item.kind}`}
              data-shelf-interaction-root
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              <span className="taste-kind">{kindLabels[item.kind]}</span>
              <ShelfArtwork item={item} />
              <span className="taste-copy">
                <span className="taste-title">{item.title}</span>
                <ShelfMeta item={item} />
              </span>
            </ShelfLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FavoriteCollections({
  items,
}: {
  items: readonly ShelfItem[];
}) {
  return (
    <div className="favorites-collections page-reveal-root">
      {shelfSections.map((section) => {
        const sectionItems = items.filter((item) => item.kind === section.kind);

        return (
          <section
            aria-labelledby={`${section.id}-title`}
            className="favorites-collection"
            id={section.id}
            key={section.id}
          >
            <header className="favorites-collection-heading">
              <span className="favorites-collection-copy">
                <h2 id={`${section.id}-title`}>{section.title}</h2>
                <p>{section.description}</p>
              </span>
            </header>

            <div className="wide-bleed favorites-scroll-frame">
              <ScrollArea
                aria-labelledby={`${section.id}-title`}
                className={`favorites-scroll-area favorites-scroll-area-${section.kind}`}
                orientation="vertical"
                role="region"
                viewportClassName="favorites-scroll-viewport scroll-fade"
              >
                <ul
                  aria-label={`${section.title} favorites`}
                  className="favorites-list"
                >
                  {sectionItems.map((item) => (
                    <li className="favorites-row" key={item.id}>
                      <ShelfLink
                        aria-label={getShelfLinkLabel(item)}
                        className={`favorites-card favorites-card-${item.kind}`}
                        data-shelf-interaction-root
                        href={item.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <PixelRating rating={getRating(item)} />
                        <span className="favorites-card-inner">
                          <span
                            className={`favorites-cover-frame favorites-cover-frame-${item.kind}`}
                          >
                            <ShelfArtwork item={item} />
                          </span>
                          <span className="favorites-card-copy">
                            <span className="favorites-title">{item.title}</span>
                            <ShelfMeta item={item} />
                          </span>
                        </span>
                      </ShelfLink>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </section>
        );
      })}
    </div>
  );
}
