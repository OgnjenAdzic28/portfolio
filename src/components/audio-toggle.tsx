import { AnimatePresence, motion } from "motion/react";
import { setEnabled } from "cuelume";
import { useEffect, useSyncExternalStore } from "react";
import { Tooltip } from "@/components/ui/tooltip";

const storageKey = "ognjen-sound";
const soundChangeEvent = "ognjen-sound-change";

function getSnapshot() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return window.localStorage.getItem(storageKey) !== "muted";
  } catch {
    return true;
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(soundChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(soundChangeEvent, onStoreChange);
  };
}

function SoundIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="site-footer-control-icon"
      fill="currentColor"
      focusable="false"
      shapeRendering="crispEdges"
      viewBox="0 0 24 24"
    >
      <path
        d={
          enabled
            ? "M13 22h-2v-2H9v-2h2V6H9V4h2V2h2v20Zm-4-4H7v-2h2v2Zm10 0h-4v-2h4v2ZM7 10H5v4h2v2H3V8h4v2Zm14 6h-2V8h2v8Zm-4-2h-2v-4h2v4ZM9 8H7V6h2v2Zm10 0h-4V6h4v2Z"
            : "M13 22h-2v-2H9v-2h2V6H9V4h2V2h2v20Zm-4-4H7v-2h2v2ZM7 10H5v4h2v2H3V8h4v2ZM9 8H7V6h2v2Zm8 0h2v2h-2V8Zm4-2h2v2h-2V6Zm-2 4h2v2h-2v-2Zm2 2h2v2h-2v-2Zm-4 2h2v2h-2v-2Z"
        }
      />
    </svg>
  );
}

export function AudioToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const label = enabled ? "Mute sound effects" : "Enable sound effects";

  useEffect(() => {
    setEnabled(enabled);
  }, [enabled]);

  return (
    <Tooltip content={label} sideOffset={10}>
      <button
        type="button"
        className="audio-toggle site-footer-control"
        aria-label={label}
        aria-pressed={!enabled}
        data-cuelume-hover="tick"
        data-cuelume-toggle="toggle"
        onClick={() => {
          const nextEnabled = !enabled;
          setEnabled(nextEnabled);

          try {
            window.localStorage.setItem(
              storageKey,
              nextEnabled ? "enabled" : "muted",
            );
          } catch {
            // The in-memory preference still applies when storage is unavailable.
          }

          window.dispatchEvent(new Event(soundChangeEvent));
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            className="site-footer-control-icon-wrap"
            exit={{ filter: "blur(4px)", opacity: 0, scale: 0.25 }}
            initial={{ filter: "blur(4px)", opacity: 0, scale: 0.25 }}
            key={enabled ? "sound-on" : "sound-off"}
            transition={{ bounce: 0, duration: 0.3, type: "spring" }}
          >
            <SoundIcon enabled={enabled} />
          </motion.span>
        </AnimatePresence>
      </button>
    </Tooltip>
  );
}
