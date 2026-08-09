"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { playHoverTone } from "@/components/audio-link";

type NavigationAudioLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href"
> & {
  href: string;
  tone?: "low" | "mid" | "accent";
  transitionType: "writing-forward" | "writing-back";
};

function shouldUseNativeNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.currentTarget.target === "_blank"
  );
}

export function NavigationAudioLink({
  href,
  tone = "low",
  transitionType,
  onClick,
  onPointerEnter,
  onFocus,
  ...props
}: NavigationAudioLinkProps) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || shouldUseNativeNavigation(event)) {
          return;
        }

        event.preventDefault();
        router.push(href, { transitionTypes: [transitionType] });
      }}
      onPointerEnter={(event) => {
        router.prefetch(href);
        playHoverTone(tone);
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        router.prefetch(href);
        playHoverTone(tone);
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
