import type { SoundName } from "cuelume";
import type { ComponentPropsWithRef } from "react";
import { Link, type LinkProps } from "react-router";

type AudioLinkProps = ComponentPropsWithRef<"a"> & {
  hoverSound?: SoundName | false;
  prefetch?: LinkProps["prefetch"];
  sound?: "default" | "home";
  viewTransition?: boolean;
};

function isInternalHref(href: string | undefined) {
  return (
    href?.startsWith("/") === true && href.startsWith("//") === false
  );
}

export function AudioLink({
  hoverSound,
  sound = "default",
  href,
  target,
  download,
  onClick,
  prefetch,
  ref,
  viewTransition,
  ...props
}: AudioLinkProps) {
  const resolvedHoverSound =
    hoverSound === false
      ? undefined
      : (hoverSound ?? (sound === "home" ? "bloom" : "release"));
  const shouldUseRouter =
    isInternalHref(href) &&
    (target === undefined || target === "" || target === "_self") &&
    (download === undefined || download === false);

  if (shouldUseRouter && href !== undefined) {
    return (
      <Link
        data-cuelume-hover={resolvedHoverSound}
        data-cuelume-toggle="sparkle"
        onClick={onClick}
        prefetch={prefetch ?? "intent"}
        ref={ref}
        target={target}
        to={href}
        viewTransition={viewTransition}
        {...props}
      />
    );
  }

  return (
    <a
      data-cuelume-hover={resolvedHoverSound}
      data-cuelume-toggle="sparkle"
      download={download}
      href={href}
      onClick={onClick}
      ref={ref}
      target={target}
      {...props}
    />
  );
}
