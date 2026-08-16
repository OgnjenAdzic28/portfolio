import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { AudioLink } from "@/components/audio-link";

type NavigationAudioLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href"
> & {
  href: string;
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
  transitionType,
  onClick,
  ...props
}: NavigationAudioLinkProps) {
  return (
    <AudioLink
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || shouldUseNativeNavigation(event)) {
          return;
        }

        document.documentElement.dataset.routeTransition = transitionType;
        window.setTimeout(() => {
          delete document.documentElement.dataset.routeTransition;
        }, 700);
      }}
      viewTransition
      {...props}
    />
  );
}
