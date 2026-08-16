import { cn } from "@/lib/utils";

interface Card17Props {
  /** Album title used when cover art is unavailable. */
  title: string;
  /** Artist used when cover art is unavailable. */
  artist?: string;
  /** Cover art URL. */
  src?: string;
  /** Additional classes merged onto the root. */
  className?: string;
}

export const card17Demo: Card17Props = {
  title: "Midnight Frequencies",
  artist: "Aurora Fields",
};

/**
 * Adapted from Beste UI's Vinyl Record Card. The disc stays completely behind
 * the sleeve at rest, then slides out and spins when the cover is hovered.
 */
export function Card17({ title, artist, src, className }: Card17Props) {
  return (
    <span
      className={cn(
        "card17-root relative isolate block aspect-square w-full",
        className,
      )}
    >
      {/* Translation and rotation use separate layers so the spin never
          overrides the slide transform. */}
      <span
        aria-hidden="true"
        className="card17-record-carriage absolute inset-[4%] z-0 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
      >
        <span
          className="card17-record-disc absolute inset-0 rounded-full shadow-xl"
          style={{
            background:
              "repeating-radial-gradient(circle at center, #09090b 0 1.4px, #202024 1.4px 2.8px)",
          }}
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 40deg, transparent 0 30deg, rgb(255 255 255 / 0.08) 50deg, transparent 70deg, transparent 210deg, rgb(255 255 255 / 0.06) 230deg, transparent 250deg)",
            }}
          />
          <span className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-amber-100 ring-1 ring-black/30">
            {src ? (
              <img
                alt=""
                className="absolute inset-0 size-full object-cover"
                decoding="async"
                loading="lazy"
                src={src}
              />
            ) : null}
          </span>
          <span className="absolute left-1/2 top-1/2 size-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-100 ring-1 ring-black/40" />
        </span>
      </span>

      <span className="relative z-10 block size-full overflow-hidden rounded-[4px] bg-zinc-900 shadow-[0_14px_30px_-16px_rgb(0_0_0_/_0.7)] ring-1 ring-black/20">
        {src ? (
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            decoding="async"
            loading="lazy"
            src={src}
          />
        ) : (
          <span className="absolute inset-0 flex flex-col justify-between p-4 text-left text-white">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
              {artist}
            </span>
            <span className="font-serif text-lg leading-tight">{title}</span>
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[4px] ring-1 ring-inset ring-white/10"
        />
      </span>
    </span>
  );
}
