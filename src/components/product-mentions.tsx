import type { ReactNode } from "react";
import { Fragment } from "react";

type ProductMention = {
  href?: string;
  icon: string;
  label: string;
  product:
    | "invokeable"
    | "hush"
    | "doorman"
    | "gntai"
    | "pingless"
    | "pennyone"
    | "archistella";
};

type ProductMentionsProps = {
  items: ProductMention[];
  leading?: ReactNode;
  separator?: string | string[];
  trailing?: ReactNode;
};

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

// Each product shows as its icon in the sentence; the name appears as a small
// tooltip on hover or keyboard focus, and the icon links out when there is a URL.
export function ProductMentions({
  items,
  leading,
  separator = " ",
  trailing,
}: ProductMentionsProps) {
  function separatorText(index: number) {
    return Array.isArray(separator) ? (separator[index] ?? " ") : separator;
  }

  return (
    <span className="product-mentions">
      {leading}
      {items.map((item, index) => {
        const content = (
          <>
            {item.product === "invokeable" ? (
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
            )}
            <span className="product-mention-name" aria-hidden="true">
              {item.label}
            </span>
          </>
        );

        return (
          <Fragment key={item.product}>
            {item.href ? (
              <a
                aria-label={item.label}
                className="product-mention-trigger"
                data-cuelume-hover="release"
                data-product={item.product}
                href={item.href}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </a>
            ) : (
              <span
                aria-label={item.label}
                className="product-mention-trigger"
                data-cuelume-hover="release"
                data-product={item.product}
                role="img"
                tabIndex={0}
              >
                {content}
              </span>
            )}
            {index < items.length - 1 ? separatorText(index) : null}
          </Fragment>
        );
      })}
      {trailing}
    </span>
  );
}
