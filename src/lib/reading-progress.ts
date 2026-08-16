const readingProgressStorageKey = "ognjen-reading-progress:v2";
const legacyReadingProgressStorageKey = "ognjen-reading-progress:v1";
const readingProgressChangeEvent = "ognjen-reading-progress-change";
const articleSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ReadingProgressState = {
  furthest: number;
  position: number;
};

type ReadingProgressMap = Record<string, ReadingProgressState>;
type StoredReadingProgress = {
  map: ReadingProgressMap;
  source: "empty" | "legacy" | "v2";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const rounded = Math.round(value);
  return Math.min(100, Math.max(0, rounded >= 99 ? 100 : rounded));
}

function emptyProgressState(): ReadingProgressState {
  return { furthest: 0, position: 0 };
}

function parseProgressMap(value: unknown): ReadingProgressMap {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([slug, progress]) => {
      if (!articleSlugPattern.test(slug) || !isRecord(progress)) {
        return [];
      }

      const { furthest, position } = progress;

      if (typeof furthest !== "number" || typeof position !== "number") {
        return [];
      }

      const normalizedPosition = normalizeProgress(position);
      const normalizedFurthest = Math.max(
        normalizeProgress(furthest),
        normalizedPosition,
      );

      return [
        [
          slug,
          { furthest: normalizedFurthest, position: normalizedPosition },
        ],
      ];
    }),
  );
}

function parseLegacyProgressMap(value: unknown): ReadingProgressMap {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([slug, progress]) => {
      if (!articleSlugPattern.test(slug) || typeof progress !== "number") {
        return [];
      }

      const normalizedProgress = normalizeProgress(progress);

      return [
        [
          slug,
          { furthest: normalizedProgress, position: normalizedProgress },
        ],
      ];
    }),
  );
}

function readStoredProgress(): StoredReadingProgress {
  if (typeof window === "undefined") {
    return { map: {}, source: "empty" };
  }

  try {
    const storedValue = window.localStorage.getItem(readingProgressStorageKey);

    if (storedValue !== null) {
      return {
        map: parseProgressMap(JSON.parse(storedValue) as unknown),
        source: "v2",
      };
    }

    const legacyStoredValue = window.localStorage.getItem(
      legacyReadingProgressStorageKey,
    );

    if (legacyStoredValue !== null) {
      return {
        map: parseLegacyProgressMap(JSON.parse(legacyStoredValue) as unknown),
        source: "legacy",
      };
    }
  } catch {
    return { map: {}, source: "empty" };
  }

  return { map: {}, source: "empty" };
}

export function getReadingProgressState(slug: string): ReadingProgressState {
  if (!articleSlugPattern.test(slug)) {
    return emptyProgressState();
  }

  const { map } = readStoredProgress();
  const progress = Object.hasOwn(map, slug) ? map[slug] : emptyProgressState();

  return { ...progress };
}

export function getReadingProgress(slug: string) {
  return getReadingProgressState(slug).furthest;
}

export function saveReadingProgress(
  slug: string,
  position: number,
): ReadingProgressState {
  if (typeof window === "undefined" || !articleSlugPattern.test(slug)) {
    return emptyProgressState();
  }

  const storedProgress = readStoredProgress();
  const currentProgress = Object.hasOwn(storedProgress.map, slug)
    ? storedProgress.map[slug]
    : emptyProgressState();
  const nextPosition = normalizeProgress(position);
  const nextProgress = {
    furthest: Math.max(currentProgress.furthest, nextPosition),
    position: nextPosition,
  };
  const progressChanged =
    nextProgress.furthest !== currentProgress.furthest ||
    nextProgress.position !== currentProgress.position;

  if (!progressChanged && storedProgress.source === "v2") {
    return { ...currentProgress };
  }

  try {
    window.localStorage.setItem(
      readingProgressStorageKey,
      JSON.stringify({ ...storedProgress.map, [slug]: nextProgress }),
    );
    window.localStorage.removeItem(legacyReadingProgressStorageKey);
    window.dispatchEvent(
      new CustomEvent(readingProgressChangeEvent, { detail: { slug } }),
    );
  } catch {
    return { ...currentProgress };
  }

  return nextProgress;
}

export function subscribeToReadingProgress(
  slug: string,
  onStoreChange: () => void,
) {
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === readingProgressStorageKey ||
      event.key === legacyReadingProgressStorageKey
    ) {
      onStoreChange();
    }
  };
  const handleProgressChange = (event: Event) => {
    const changedSlug = (event as CustomEvent<{ slug?: string }>).detail?.slug;

    if (changedSlug === slug) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(readingProgressChangeEvent, handleProgressChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(readingProgressChangeEvent, handleProgressChange);
  };
}
