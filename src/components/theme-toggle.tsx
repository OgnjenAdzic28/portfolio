import { play } from "cuelume";
import { useEffect, useSyncExternalStore } from "react";
import { ThemeModeIcon } from "@/components/theme-mode-icon";
import { Tooltip } from "@/components/ui/tooltip";

type Theme = "light" | "dark";

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

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.matches("input, textarea, select") ||
          Boolean(target.closest('[contenteditable="true"]')));

      if (
        event.defaultPrevented ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== "d" ||
        isTyping
      ) {
        return;
      }

      event.preventDefault();
      const activeTheme = getSnapshot();
      play("toggle");
      applyTheme(activeTheme === "dark" ? "light" : "dark");
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Tooltip content={`${label} (D)`} sideOffset={10}>
      <button
        type="button"
        className="theme-toggle site-footer-control"
        aria-label={label}
        aria-keyshortcuts="d"
        aria-pressed={theme === "dark"}
        data-cuelume-hover="tick"
        data-cuelume-toggle="toggle"
        onClick={() => {
          applyTheme(nextTheme);
        }}
      >
        <span className="site-footer-control-icon-wrap theme-toggle-icons">
          <ThemeModeIcon
            aria-hidden="true"
            className="site-footer-control-icon theme-toggle-icon-light"
            mode="dark"
            size={18}
          />
          <ThemeModeIcon
            aria-hidden="true"
            className="site-footer-control-icon theme-toggle-icon-dark"
            mode="light"
            size={18}
          />
        </span>
      </button>
    </Tooltip>
  );
}
