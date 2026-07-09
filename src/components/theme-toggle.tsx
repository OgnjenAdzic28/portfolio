"use client";

import { useSyncExternalStore } from "react";
import { playHoverTone } from "@/components/audio-link";
import { ThemeModeIcon } from "@/components/theme-mode-icon";

type Theme = "light" | "dark";

type ViewTransition = {
  finished: Promise<void>;
};

type TransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => void) => ViewTransition;
};

const storageKey = "ognjen-theme";
const themeChangeEvent = "ognjen-theme-change";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  const storedTheme = window.localStorage.getItem(storageKey);

  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const activeTheme = document.documentElement.dataset.theme;

  if (activeTheme === "dark" || activeTheme === "light") {
    return activeTheme;
  }

  return getPreferredTheme();
}

function subscribe(onStoreChange: () => void) {
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (getStoredTheme()) {
      onStoreChange();
      return;
    }

    applyTheme(getPreferredTheme(), { persist: false });
  };

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(themeChangeEvent, onStoreChange);
  colorSchemeQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(themeChangeEvent, onStoreChange);
    colorSchemeQuery.removeEventListener("change", handleSystemThemeChange);
  };
}

function applyTheme(theme: Theme, options: { persist?: boolean } = {}) {
  const { persist = true } = options;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (persist) {
    window.localStorage.setItem(storageKey, theme);
  }
  window.dispatchEvent(new Event(themeChangeEvent));
}

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyThemeWithWarp(theme: Theme) {
  const transitionDocument = document as TransitionDocument;

  if (!transitionDocument.startViewTransition || shouldReduceMotion()) {
    applyTheme(theme);
    return;
  }

  document.documentElement.dataset.themeTransition = "warp";

  const transition = transitionDocument.startViewTransition(() => {
    applyTheme(theme);
  });

  void transition.finished.finally(() => {
    delete document.documentElement.dataset.themeTransition;
  });
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="mark-link"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
      onPointerEnter={() => playHoverTone("accent")}
      onFocus={() => playHoverTone("accent")}
      onClick={() => {
        applyThemeWithWarp(nextTheme);
        playHoverTone(nextTheme === "dark" ? "mid" : "accent");
      }}
    >
      <ThemeModeIcon aria-hidden="true" mode={nextTheme} size={20} />
    </button>
  );
}
