import { useCallback, useSyncExternalStore } from "react";
import {
  getReadingProgress,
  subscribeToReadingProgress,
} from "@/lib/reading-progress";

export function useReadingProgress(slug: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      subscribeToReadingProgress(slug, onStoreChange),
    [slug],
  );
  const getSnapshot = useCallback(() => getReadingProgress(slug), [slug]);

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
