"use client";

import type {
  AnchorHTMLAttributes,
  CSSProperties,
  FocusEvent,
  ReactNode,
} from "react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { playHoverTone, playScaleTone } from "@/components/audio-link";

type AnimatedPillItem = AnchorHTMLAttributes<HTMLAnchorElement> & {
  explanation: string;
  label: string;
};

type AnimatedPillLinksProps = {
  items: AnimatedPillItem[];
  leading?: ReactNode;
  separator?: string;
  trailing: string;
};

type ExitingState = {
  id: number;
  label: string | null;
};

function wordStyle(index: number): CSSProperties {
  return { "--word-index": index } as CSSProperties;
}

function isHoverCapable() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function AnimatedWordText({
  text,
  wordClassName = "animated-pill-word",
}: {
  text: string;
  wordClassName?: string;
}) {
  let wordIndex = 0;

  return text.split(/(\s+)/).map((part, index) => {
    if (!part) {
      return null;
    }

    if (/^\s+$/.test(part)) {
      return part;
    }

    const currentWordIndex = wordIndex;
    wordIndex += 1;

    return (
      <span
        key={`${part}-${index}`}
        className={wordClassName}
        style={wordStyle(currentWordIndex)}
      >
        {part}
      </span>
    );
  });
}

export function AnimatedPillLinks({
  items,
  leading,
  separator = " ",
  trailing,
}: AnimatedPillLinksProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [exitingState, setExitingState] = useState<ExitingState | null>(null);
  const [supportsHover, setSupportsHover] = useState(true);
  const rootRef = useRef<HTMLSpanElement>(null);
  const exitIdRef = useRef(0);
  const scaleToneTimeoutsRef = useRef<number[]>([]);

  const activeItem = useMemo(
    () => items.find((item) => item.label === activeLabel) ?? null,
    [activeLabel, items],
  );
  const activeIndex = useMemo(
    () => items.findIndex((item) => item.label === activeLabel),
    [activeLabel, items],
  );
  const returningLabel = activeLabel === null ? exitingState?.label : null;
  const returningIndex =
    returningLabel === undefined || returningLabel === null
      ? -1
      : items.findIndex((item) => item.label === returningLabel);
  const isReturningToDefault = returningIndex > -1;

  useEffect(() => {
    if (!exitingState) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setExitingState((currentState) =>
        currentState?.id === exitingState.id ? null : currentState,
      );
    }, 420);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [exitingState]);

  const clearScaleToneSequence = useCallback(() => {
    scaleToneTimeoutsRef.current.forEach((timeout) => {
      window.clearTimeout(timeout);
    });
    scaleToneTimeoutsRef.current = [];
  }, []);

  function playHoverScaleSequence(explanation: string) {
    clearScaleToneSequence();

    const wordCount = explanation.split(/\s+/).filter(Boolean).length;
    const totalSteps = Math.min(7, Math.max(4, Math.ceil(wordCount / 2)));

    for (let step = 0; step < totalSteps; step += 1) {
      const timeout = window.setTimeout(() => {
        playScaleTone(step, totalSteps);
      }, 42 + step * 46);

      scaleToneTimeoutsRef.current.push(timeout);
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverSupport = () => {
      const nextSupportsHover = isHoverCapable();

      setSupportsHover(nextSupportsHover);

      if (!nextSupportsHover) {
        clearScaleToneSequence();
        setActiveLabel(null);
        setExitingState(null);
      }
    };
    const animationFrame = window.requestAnimationFrame(updateHoverSupport);

    mediaQuery.addEventListener("change", updateHoverSupport);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mediaQuery.removeEventListener("change", updateHoverSupport);
    };
  }, [clearScaleToneSequence]);

  useEffect(() => {
    return () => {
      clearScaleToneSequence();
    };
  }, [clearScaleToneSequence]);

  function queueExit(label: string | null) {
    setExitingState({
      id: exitIdRef.current,
      label,
    });
    exitIdRef.current += 1;
  }

  function resetActive() {
    if (!supportsHover || !isHoverCapable()) {
      return;
    }

    if (activeLabel !== null) {
      queueExit(activeLabel);
      playHoverTone("mid");
    }

    setActiveLabel(null);
  }

  function setActive(item: AnimatedPillItem) {
    if (!supportsHover || !isHoverCapable()) {
      return;
    }

    if (activeLabel === item.label) {
      return;
    }

    playHoverTone("accent");
    playHoverScaleSequence(item.explanation);
    queueExit(activeLabel);
    setActiveLabel(item.label);
  }

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    if (
      supportsHover &&
      isHoverCapable() &&
      !rootRef.current?.contains(event.relatedTarget)
    ) {
      resetActive();
    }
  }

  function renderMeasurementState(measuredActiveIndex: number | null) {
    const measuredActiveItem =
      measuredActiveIndex === null ? null : items[measuredActiveIndex];

    return (
      <>
        {leading}
        {items.map(({ label }, index) => {
          const isHidden =
            measuredActiveIndex !== null && index > measuredActiveIndex;
          const shouldRenderSeparator = index < items.length - 1;
          const isSeparatorHidden =
            measuredActiveIndex !== null && index >= measuredActiveIndex;

          if (isHidden) {
            return null;
          }

          return (
            <Fragment key={label}>
              <span className="pill pill-link animated-pill-link">{label}</span>
              {shouldRenderSeparator && !isSeparatorHidden ? (
                <span className="animated-pill-separator">
                  {" "}
                  {separator}{" "}
                </span>
              ) : null}
            </Fragment>
          );
        })}
        {measuredActiveItem ? (
          <span className="animated-pill-explanation">
            {" "}
            <AnimatedWordText text={measuredActiveItem.explanation} />
          </span>
        ) : (
          <span className="animated-pill-trailing">{trailing}</span>
        )}
      </>
    );
  }

  function isItemVisible(stateIndex: number, index: number) {
    return stateIndex === -1 || index <= stateIndex;
  }

  function isSeparatorVisible(stateIndex: number, index: number) {
    return index < items.length - 1 && (stateIndex === -1 || index < stateIndex);
  }

  function renderExitLayer(exiting: ExitingState) {
    const previousIndex = items.findIndex((item) => item.label === exiting.label);
    const previousItem = previousIndex > -1 ? items[previousIndex] : null;
    const shouldExitExplanation =
      previousItem !== null && previousItem.label !== activeItem?.label;
    const shouldExitTrailing = exiting.label === null && activeLabel !== null;

    return (
      <span
        key={exiting.id}
        className="animated-pill-exit"
        aria-hidden="true"
      >
        {leading ? (
          <span className="animated-pill-exit-placeholder">{leading}</span>
        ) : null}
        {items.map(({ label }, index) => {
          const wasItemVisible = isItemVisible(previousIndex, index);
          const isItemStillVisible = isItemVisible(activeIndex, index);
          const wasSeparatorVisible = isSeparatorVisible(previousIndex, index);
          const isSeparatorStillVisible = isSeparatorVisible(activeIndex, index);

          if (!wasItemVisible && !wasSeparatorVisible) {
            return null;
          }

          return (
            <Fragment key={label}>
              {wasItemVisible ? (
                <span
                  className="pill pill-link animated-pill-link"
                  data-exiting={!isItemStillVisible ? "true" : undefined}
                >
                  {label}
                </span>
              ) : null}
              {wasSeparatorVisible ? (
                <span
                  className="animated-pill-separator"
                  data-exiting={!isSeparatorStillVisible ? "true" : undefined}
                >
                  {" "}
                  {separator}{" "}
                </span>
              ) : null}
            </Fragment>
          );
        })}
        {shouldExitExplanation && previousItem ? (
          <span className="animated-pill-explanation" data-exiting="true">
            {" "}
            <AnimatedWordText
              text={previousItem.explanation}
              wordClassName="animated-pill-out-word"
            />
          </span>
        ) : previousItem ? (
          <span className="animated-pill-exit-placeholder">
            {" "}
            <AnimatedWordText text={previousItem.explanation} />
          </span>
        ) : null}
        {exiting.label === null ? (
          <span
            className={
              shouldExitTrailing
                ? "animated-pill-trailing"
                : "animated-pill-exit-placeholder"
            }
            data-exiting={shouldExitTrailing ? "true" : undefined}
          >
            <AnimatedWordText
              text={trailing}
              wordClassName="animated-pill-out-word"
            />
          </span>
        ) : null}
      </span>
    );
  }

  if (!supportsHover) {
    return (
      <span
        className="animated-pill-cluster"
        data-block={leading ? "true" : undefined}
      >
        {leading}
        {items.map((item, index) => {
          const { explanation, label, ...props } = item;

          return (
            <Fragment key={label}>
              <a
                {...props}
                aria-label={props["aria-label"] ?? `${label}: ${explanation}`}
                className="pill pill-link animated-pill-link"
              >
                {label}
              </a>
              {index < items.length - 1 ? (
                <span className="animated-pill-separator">
                  {" "}
                  {separator}{" "}
                </span>
              ) : null}
            </Fragment>
          );
        })}
        <span className="animated-pill-trailing">{trailing}</span>
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      className="animated-pill-cluster"
      data-block={leading ? "true" : undefined}
      data-active={activeItem ? "true" : undefined}
      onBlur={handleBlur}
      onPointerLeave={resetActive}
    >
      <span className="animated-pill-sizer" aria-hidden="true">
        <span className="animated-pill-measure">
          {renderMeasurementState(null)}
        </span>
        {items.map((item, index) => (
          <span key={item.label} className="animated-pill-measure">
            {renderMeasurementState(index)}
          </span>
        ))}
      </span>

      <span className="animated-pill-live">
        {leading}
        {items.map(({ explanation, label, onFocus, onPointerEnter, ...props }, index) => {
          const isHidden = activeIndex > -1 && index > activeIndex;
          const shouldRenderSeparator = index < items.length - 1;
          const isSeparatorHidden = activeIndex > -1 && index >= activeIndex;
          const isReturningItem =
            isReturningToDefault && !isItemVisible(returningIndex, index);
          const isReturningSeparator =
            isReturningToDefault && !isSeparatorVisible(returningIndex, index);

          return (
            <Fragment key={label}>
              <a
                {...props}
                aria-label={`${label}: ${explanation}`}
                className="pill pill-link animated-pill-link"
                data-entering={isReturningItem ? "true" : undefined}
                data-hidden={isHidden ? "true" : undefined}
                tabIndex={isHidden ? -1 : props.tabIndex}
                onFocus={(event) => {
                  setActive({ explanation, label, ...props });
                  onFocus?.(event);
                }}
                onPointerEnter={(event) => {
                  setActive({ explanation, label, ...props });
                  onPointerEnter?.(event);
                }}
              >
                {label}
              </a>
              {shouldRenderSeparator ? (
                <span
                  className="animated-pill-separator"
                  data-entering={isReturningSeparator ? "true" : undefined}
                  data-hidden={isSeparatorHidden ? "true" : undefined}
                >
                  {" "}
                  {separator}{" "}
                </span>
              ) : null}
            </Fragment>
          );
        })}
        {activeItem ? (
          <span
            key={activeItem.label}
            className="animated-pill-explanation"
            aria-live="polite"
          >
            {" "}
            <AnimatedWordText text={activeItem.explanation} />
          </span>
        ) : null}
        <span
          className="animated-pill-trailing"
          data-hidden={activeItem ? "true" : undefined}
          aria-hidden={activeItem ? true : undefined}
        >
          {isReturningToDefault ? (
            <AnimatedWordText
              text={trailing}
              wordClassName="animated-pill-return-word"
            />
          ) : (
            trailing
          )}
        </span>
      </span>
      {exitingState ? renderExitLayer(exitingState) : null}
    </span>
  );
}
