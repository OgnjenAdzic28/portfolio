import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ShelfCoverInteractionProps = {
  children: ReactNode;
  className?: string;
};

const coverSpring = {
  damping: 28,
  mass: 1,
  stiffness: 400,
};

const spotlightSpring = {
  damping: 4.1,
  mass: 0.2,
  stiffness: 26.7,
};

export function ShelfCoverInteraction({
  children,
  className,
}: ShelfCoverInteractionProps) {
  const reduceMotion = useReducedMotion();
  const coverRef = useRef<HTMLSpanElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const scaleSource = useMotionValue(1);
  const spotlightXSource = useMotionValue(0);
  const spotlightYSource = useMotionValue(0);
  const spotlightOpacitySource = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [6, -6]),
    coverSpring,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-6, 6]),
    coverSpring,
  );
  const scale = useSpring(scaleSource, coverSpring);
  const spotlightX = useSpring(spotlightXSource, spotlightSpring);
  const spotlightY = useSpring(spotlightYSource, spotlightSpring);
  const spotlightOpacity = useSpring(
    spotlightOpacitySource,
    spotlightSpring,
  );
  const coverTransform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  const spotlightTransform = useMotionTemplate`translate3d(${spotlightX}px, ${spotlightY}px, 0)`;

  useEffect(() => {
    if (!coverRef.current) {
      return;
    }

    const cover = coverRef.current;
    const interactionRoot =
      cover.closest<HTMLElement>("[data-shelf-interaction-root]") ?? cover;

    function updatePointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || reduceMotion) {
        return;
      }

      const bounds = cover.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width);
      const y = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height);

      pointerX.set(x / bounds.width - 0.5);
      pointerY.set(y / bounds.height - 0.5);
      spotlightXSource.set(x);
      spotlightYSource.set(y);
    }

    function handlePointerEnter(event: PointerEvent) {
      if (event.pointerType !== "mouse" || reduceMotion) {
        return;
      }

      scaleSource.set(1.08);
      spotlightOpacitySource.set(1);
      updatePointer(event);
    }

    function resetPointer() {
      pointerX.set(0);
      pointerY.set(0);
      scaleSource.set(1);
      spotlightOpacitySource.set(0);
    }

    interactionRoot.addEventListener("pointercancel", resetPointer);
    interactionRoot.addEventListener("pointerenter", handlePointerEnter);
    interactionRoot.addEventListener("pointerleave", resetPointer);
    interactionRoot.addEventListener("pointermove", updatePointer);

    return () => {
      interactionRoot.removeEventListener("pointercancel", resetPointer);
      interactionRoot.removeEventListener("pointerenter", handlePointerEnter);
      interactionRoot.removeEventListener("pointerleave", resetPointer);
      interactionRoot.removeEventListener("pointermove", updatePointer);
    };
  }, [
    pointerX,
    pointerY,
    reduceMotion,
    scaleSource,
    spotlightOpacitySource,
    spotlightXSource,
    spotlightYSource,
  ]);

  return (
    <motion.span
      aria-hidden="true"
      className={cn(
        "shelf-cover-interaction relative block [transform-style:preserve-3d]",
        className,
      )}
      ref={coverRef}
      style={{
        transform: reduceMotion ? "none" : coverTransform,
        willChange: reduceMotion ? "auto" : "transform",
      }}
    >
      {children}
      <span className="shelf-cover-spotlight pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[4px]">
        <motion.span
          className="absolute left-0 top-0 block"
          style={{
            opacity: reduceMotion ? 0 : spotlightOpacity,
            transform: reduceMotion ? "none" : spotlightTransform,
            willChange: reduceMotion ? "auto" : "transform, opacity",
          }}
        >
          <span className="block size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-2xl mix-blend-screen" />
        </motion.span>
      </span>
    </motion.span>
  );
}
