import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavigationAudioLink } from "@/components/navigation-audio-link";
import { ReadingProgressDate } from "@/components/reading-progress-date";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip } from "@/components/ui/tooltip";
import styles from "./writing.module.css";

type WritingPost = {
  description: string;
  formattedDate: string;
  publishedAt: string;
  slug: string;
  title: string;
};

function highlightText(text: string, query: string) {
  if (!query) {
    return text;
  }

  const normalizedText = text.toLocaleLowerCase();
  const fragments = [];
  let cursor = 0;
  let matchIndex = normalizedText.indexOf(query, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      fragments.push(text.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + query.length;
    fragments.push(
      <mark className={styles.searchMatch} key={`${matchIndex}-${matchEnd}`}>
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );
    cursor = matchEnd;
    matchIndex = normalizedText.indexOf(query, cursor);
  }

  if (cursor === 0) {
    return text;
  }

  if (cursor < text.length) {
    fragments.push(text.slice(cursor));
  }

  return fragments;
}

export function WritingArchive({ posts }: { posts: WritingPost[] }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      `${post.title} ${post.description}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, posts]);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.shiftKey ||
        (!event.metaKey && !event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();
      openSearch();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSearch]);

  const closeSearch = (restoreFocus = false) => {
    setQuery("");
    setSearchOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => searchToggleRef.current?.focus());
    }
  };

  const toggleSearch = () => {
    if (searchOpen) {
      closeSearch();
      return;
    }

    openSearch();
  };

  const visibleCount = normalizedQuery
    ? `${filteredPosts.length} of ${posts.length}`
    : `${posts.length}`;
  const postLabel = posts.length === 1 ? "post" : "posts";

  return (
    <section className={styles.archive} aria-label="All writing">
      <div className={styles.toolbar}>
        <span className={styles.count} aria-live="polite">
          {visibleCount} {postLabel}
        </span>

        <div className={styles.searchRail} data-open={searchOpen}>
          <span className={styles.toolbarDivider} aria-hidden="true" />
          <div className={styles.search} data-open={searchOpen} role="search">
            <input
              ref={inputRef}
              aria-controls="writing-posts"
              aria-label="Search writing"
              autoComplete="off"
              className={styles.searchInput}
              disabled={!searchOpen}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeSearch(true);
                }
              }}
              placeholder="Find it faster"
              tabIndex={searchOpen ? 0 : -1}
              type="search"
              value={query}
            />
            <Tooltip
              content={
                searchOpen
                  ? <span className="flex items-center gap-2">
                      Close search <Kbd>Esc</Kbd>
                    </span>
                  : <span className="flex items-center gap-2">
                      Search writing
                      <KbdGroup>
                        <Kbd>⌘K</Kbd>
                        <span aria-hidden="true">/</span>
                        <Kbd>Ctrl K</Kbd>
                      </KbdGroup>
                    </span>
              }
              sideOffset={10}
            >
              <button
                ref={searchToggleRef}
                aria-controls="writing-posts"
                aria-expanded={searchOpen}
                aria-keyshortcuts="Meta+K Control+K"
                aria-label={
                  searchOpen ? "Close writing search" : "Search writing"
                }
                className={styles.searchToggle}
                data-cuelume-hover="tick"
                data-cuelume-press="press"
                data-cuelume-release="release"
                onClick={toggleSearch}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className={styles.searchIcon}
                  fill="currentColor"
                  shapeRendering="crispEdges"
                  viewBox="0 0 18 18"
                >
                  <path d="M5 2h6v2H5V2ZM3 4h2v7H3V4Zm8 0h2v7h-2V4Zm-6 7h6v2H5v-2Zm7 1h2v2h-2v-2Zm2 2h2v2h-2v-2Z" />
                </svg>
                <svg
                  aria-hidden="true"
                  className={styles.closeIcon}
                  fill="currentColor"
                  shapeRendering="crispEdges"
                  viewBox="0 0 18 18"
                >
                  <path d="M3 3h2v2H3V3Zm2 2h2v2H5V5Zm2 2h4v4H7V7Zm4-2h2v2h-2V5Zm2-2h2v2h-2V3ZM5 11h2v2H5v-2Zm-2 2h2v2H3v-2Zm8-2h2v2h-2v-2Zm2 2h2v2h-2v-2Z" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={styles.postList} id="writing-posts">
        {filteredPosts.map((post, index) => {
          const isLatest = post.slug === posts[0]?.slug && !normalizedQuery;

          return (
            <article className={styles.post} key={post.slug}>
              {index < filteredPosts.length - 1 ? (
                <span className={styles.divider} aria-hidden="true" />
              ) : null}
              <NavigationAudioLink
                className={styles.postLink}
                href={`/writing/${post.slug}`}
                transitionType="writing-forward"
              >
                <h2 className={styles.postTitle}>
                  {highlightText(post.title, normalizedQuery)}
                </h2>
                <p className={styles.postDescription}>
                  {highlightText(post.description, normalizedQuery)}
                </p>
                <span className={styles.postMeta}>
                  <ReadingProgressDate
                    className={styles.postProgressDate}
                    dateTime={post.publishedAt}
                    formattedDate={post.formattedDate}
                    slug={post.slug}
                  />
                  <span className={styles.postSource}>Ognjen Adzic</span>
                </span>
              </NavigationAudioLink>
              {isLatest ? (
                <span className={styles.latestNote} aria-hidden="true">
                  <svg
                    className={styles.latestNoteGraphic}
                    fill="none"
                    viewBox="0 0 260 112"
                  >
                    <path
                      className={styles.latestBracketStroke}
                      d="M17 11C26 8 35 7 45 9C42 31 42 52 44 73C45 82 45 90 46 99C36 101 26 100 16 96"
                    />
                    <text className={styles.latestNoteWriting} x="68" y="43">
                      the latest one,
                    </text>
                    <text className={styles.latestNoteWriting} x="68" y="79">
                      start here
                    </text>
                  </svg>
                </span>
              ) : null}
            </article>
          );
        })}

        {filteredPosts.length === 0 ? (
          <p className={styles.emptyState}>Nothing matched that search.</p>
        ) : null}
      </div>
    </section>
  );
}
