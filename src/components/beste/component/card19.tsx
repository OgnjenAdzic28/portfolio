import { cn } from "@/lib/utils";

interface Card19Props {
  /** Book title used when cover art is unavailable. */
  title: string;
  /** Author used when cover art is unavailable. */
  author?: string;
  /** Cover art URL. */
  src?: string;
  /** Additional classes merged onto the root. */
  className?: string;
}

export const card19Demo: Card19Props = {
  title: "The Component Handbook",
  author: "Beste Studio",
};

/**
 * Adapted from Beste UI's Book Cover Card. The front cover turns from the
 * spine to reveal the page block underneath.
 */
export function Card19({ title, author, src, className }: Card19Props) {
  return (
    <span
      className={cn(
        "card19-root relative block aspect-[2/3] w-full [perspective:1000px]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -right-1.5 inset-y-1 left-3 rounded-r-[4px] shadow-sm"
        style={{
          background:
            "repeating-linear-gradient(to bottom, #fff 0 3px, #e4e4e7 3px 4px)",
        }}
      />

      <span
        className="card19-cover absolute inset-0 origin-left overflow-hidden rounded-[4px] bg-zinc-900 shadow-lg transition-[transform,box-shadow] duration-500 [backface-visibility:hidden] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
      >
        {src ? (
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            loading="lazy"
            src={src}
          />
        ) : (
          <span className="absolute inset-0 flex flex-col justify-between p-3 text-left text-white">
            <span className="font-mono text-[9px] uppercase tracking-widest opacity-70">
              {author}
            </span>
            <span className="font-serif text-base leading-tight">{title}</span>
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/30 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[4px] ring-1 ring-inset ring-white/10"
        />
      </span>
    </span>
  );
}
