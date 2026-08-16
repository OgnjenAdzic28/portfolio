import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PixelSeparator } from "@/components/pixel-separator";

type ProductMention = {
  cover: string;
  description: string;
  href?: string;
  icon: string;
  label: string;
  meta: readonly [string, string];
  product: "invokeable" | "pingless" | "archistella" | "gntai";
};

type ProductMentionsProps = {
  items: ProductMention[];
  leading?: ReactNode;
  separator?: string | string[];
  trailing?: ReactNode;
};

const previewWidth = 288;
const viewportPadding = 12;
type ProductMentionTrigger = HTMLAnchorElement | HTMLButtonElement;

function hasHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function InvokeableIcon() {
  return (
    <svg
      aria-hidden="true"
      className="product-mention-icon"
      fill="none"
      viewBox="0 0 1098 1130"
    >
      <path
        d="M832 0H266C119.092 0 0 119.092 0 266V864C0 1010.91 119.092 1130 266 1130H832C978.908 1130 1098 1010.91 1098 864V266C1098 119.092 978.908 0 832 0Z"
        fill="var(--foreground)"
      />
      <path
        d="M331 244H772C788 244 800 255 800 269C800 279 795 287 787 295L479 586C469 596 457 599 447 593C437 588 431 578 431 565V418C431 398 423 382 408 369L314 288C304 280 301 269 306 259C310 250 319 244 331 244Z"
        fill="var(--background)"
      />
      <path
        d="M327 873H773C785 873 794 867 798 858C803 847 800 836 790 828L695 745C677 730 668 711 668 688V540C668 527 662 518 652 514C641 509 630 512 621 521L311 814C303 822 299 831 302 842C305 860 314 873 327 873Z"
        fill="var(--background)"
      />
    </svg>
  );
}

function getPreviewPosition(rect: DOMRect) {
  const width = Math.min(previewWidth, window.innerWidth - viewportPadding * 2);
  const centeredLeft = rect.left + rect.width / 2 - width / 2;

  return {
    left: Math.min(
      Math.max(centeredLeft, viewportPadding),
      window.innerWidth - width - viewportPadding,
    ),
    top: rect.bottom + 12,
  };
}

export function ProductMentions({
  items,
  leading,
  separator = " ",
  trailing,
}: ProductMentionsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const triggerRefs = useRef<Array<ProductMentionTrigger | null>>([]);
  const tooltipId = useId();
  const reduceMotion = useReducedMotion();

  const activeItem = activeIndex === null ? null : items[activeIndex];
  const position = anchorRect ? getPreviewPosition(anchorRect) : null;

  function separatorText(index: number) {
    return Array.isArray(separator) ? (separator[index] ?? " ") : separator;
  }

  function showPreview(index: number, trigger: ProductMentionTrigger) {
    setAnchorRect(trigger.getBoundingClientRect());
    setActiveIndex(index);
  }

  function hidePreview(index: number) {
    setActiveIndex((currentIndex) =>
      currentIndex === index ? null : currentIndex,
    );
  }

  function handlePointerEnter(
    index: number,
    event: PointerEvent<ProductMentionTrigger>,
  ) {
    if (event.pointerType === "touch") {
      return;
    }

    hoveredIndexRef.current = index;
    showPreview(index, event.currentTarget);
  }

  function handlePointerLeave(index: number) {
    hoveredIndexRef.current = null;
    const trigger = triggerRefs.current[index];

    if (!trigger?.matches(":focus-visible")) {
      hidePreview(index);
    }
  }

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRefs.current[activeIndex];

      if (trigger) {
        setAnchorRect(trigger.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeIndex]);

  const preview =
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence initial={false}>
            {activeItem && position ? (
              <motion.div
                animate={{
                  filter: "blur(0px)",
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                aria-live="polite"
                className="product-preview-card"
                data-product={activeItem.product}
                exit={{
                  filter: reduceMotion ? "blur(0px)" : "blur(3px)",
                  opacity: 0,
                  scale: reduceMotion ? 1 : 0.99,
                  y: reduceMotion ? 0 : -3,
                }}
                id={`${tooltipId}-${activeItem.product}`}
                initial={
                  reduceMotion
                    ? false
                    : {
                        filter: "blur(6px)",
                        opacity: 0,
                        scale: 0.97,
                        y: -6,
                      }
                }
                key={activeItem.product}
                role="tooltip"
                style={position}
                transition={{
                  bounce: 0,
                  duration: reduceMotion ? 0 : 0.3,
                  type: "spring",
                }}
              >
                <div className="product-preview-content">
                  <div className="product-preview-visual">
                    <img
                      alt=""
                      className="product-preview-cover"
                      decoding="async"
                      draggable={false}
                      height={608}
                      src={activeItem.cover}
                      width={1200}
                    />
                  </div>
                  <div className="product-preview-copy">
                    <span className="product-preview-meta">
                      <span>{activeItem.meta[0]}</span>
                      <PixelSeparator />
                      <span>{activeItem.meta[1]}</span>
                    </span>
                    <strong className="product-preview-title">
                      {activeItem.label}
                    </strong>
                    <p className="product-preview-description">
                      {activeItem.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <span className="product-mentions">
      {leading}
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        const triggerContent =
          item.product === "invokeable" ? (
            <InvokeableIcon />
          ) : (
            <img
              alt=""
              aria-hidden="true"
              className="product-mention-icon"
              decoding="async"
              draggable={false}
              height={28}
              src={item.icon}
              width={28}
            />
          );
        const triggerProps = {
          "aria-describedby": isActive
            ? `${tooltipId}-${item.product}`
            : undefined,
          "aria-label": item.label,
          className: "product-mention-trigger",
          "data-cuelume-hover": "release",
          "data-cuelume-toggle": "sparkle",
          "data-product": item.product,
          onBlur: () => {
            if (hoveredIndexRef.current !== index) {
              hidePreview(index);
            }
          },
          onFocus: (event: FocusEvent<ProductMentionTrigger>) => {
            if (hasHover() || event.currentTarget.matches(":focus-visible")) {
              showPreview(index, event.currentTarget);
            }
          },
          onKeyDown: (event: KeyboardEvent<ProductMentionTrigger>) => {
            if (event.key === "Escape") {
              hidePreview(index);
            }
          },
          onPointerEnter: (event: PointerEvent<ProductMentionTrigger>) => {
            handlePointerEnter(index, event);
          },
          onPointerLeave: () => {
            handlePointerLeave(index);
          },
        };
        const setTriggerRef = (node: ProductMentionTrigger | null) => {
          triggerRefs.current[index] = node;
        };

        return (
          <Fragment key={item.product}>
            {item.href ? (
              <a
                href={item.href}
                ref={setTriggerRef}
                rel="noreferrer"
                target="_blank"
                {...triggerProps}
              >
                {triggerContent}
              </a>
            ) : (
              <button
                {...triggerProps}
                onClick={(event) => {
                  if (event.detail === 0 || hasHover()) {
                    return;
                  }

                  if (isActive) {
                    hidePreview(index);
                  } else {
                    showPreview(index, event.currentTarget);
                  }
                }}
                ref={setTriggerRef}
                type="button"
              >
                {triggerContent}
              </button>
            )}
            {index < items.length - 1 ? separatorText(index) : null}
          </Fragment>
        );
      })}
      {trailing}
      {preview}
    </span>
  );
}
