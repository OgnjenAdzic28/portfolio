import { useEffect, useRef } from "react";

type Grid = {
  cols: number;
  rows: number;
};

type Pointer = {
  /** Horizontal pointer position across the canvas, 0 to 1. */
  x: number;
};

type Put = (
  col: number,
  row: number,
  char: string,
  alpha: number,
  glint?: boolean,
) => void;

type AsciiRenderer = (
  grid: Grid,
  time: number,
  put: Put,
  pointer: Pointer | null,
) => void;

type AsciiCanvasOptions = {
  className: string;
  fontSize: number;
  lineHeight: number;
  render: AsciiRenderer;
  /** Seconds into the animation to show when motion is reduced. */
  stillTime: number;
};

// Cells are drawn in alpha buckets so each frame sets fillStyle and
// globalAlpha a couple of dozen times instead of once per character.
const ALPHA_STEPS = 14;
const FRAME_INTERVAL = 1000 / 30;

type Bucket = { x: number[]; y: number[]; ch: string[] };

function fract(value: number) {
  return value - Math.floor(value);
}

function hash(a: number, b = 0, c = 0) {
  return fract(Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453);
}

function clamp01(value: number) {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function readPalette(element: HTMLElement) {
  const styles = getComputedStyle(element);

  const boost = Number.parseFloat(styles.getPropertyValue("--ocean-boost"));

  return {
    // Light backgrounds need denser marks to read as clearly as dark ones.
    boost: Number.isFinite(boost) ? boost : 1,
    glint: styles.getPropertyValue("--ocean-glint").trim() || "#0e8fb0",
    ink: styles.getPropertyValue("--ocean-ink").trim() || "#3c6e88",
  };
}

function AsciiCanvas({
  className,
  fontSize,
  lineHeight,
  render,
  stillTime,
}: AsciiCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const colorScheme = matchMedia("(prefers-color-scheme: dark)");
    const font = `${fontSize}px "Geist Mono Variable", "Geist Mono", ui-monospace, monospace`;
    const buckets: Bucket[] = Array.from({ length: ALPHA_STEPS * 2 }, () => ({
      ch: [],
      x: [],
      y: [],
    }));
    const grid: Grid = { cols: 0, rows: 0 };
    let cellWidth = fontSize * 0.6;
    let width = 0;
    let height = 0;
    let palette = readPalette(canvas);
    let pointer: Pointer | null = null;
    let frame = 0;
    let lastFrame = 0;
    let visible = false;
    const start = performance.now();

    const put: Put = (col, row, char, alpha, glint = false) => {
      const step = Math.round(clamp01(alpha * palette.boost) * ALPHA_STEPS);

      if (step === 0 || char === " ") {
        return;
      }

      const bucket = buckets[(glint ? ALPHA_STEPS : 0) + step - 1];
      bucket.x.push(col * cellWidth);
      bucket.y.push(row * lineHeight);
      bucket.ch.push(char);
    };

    const draw = (time: number) => {
      for (const bucket of buckets) {
        bucket.x.length = 0;
        bucket.y.length = 0;
        bucket.ch.length = 0;
      }

      render(grid, time, put, pointer);

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.font = font;
      context.textBaseline = "top";

      buckets.forEach((bucket, index) => {
        if (bucket.ch.length === 0) {
          return;
        }

        const glint = index >= ALPHA_STEPS;
        context.fillStyle = glint ? palette.glint : palette.ink;
        context.globalAlpha = ((index % ALPHA_STEPS) + 1) / ALPHA_STEPS;

        for (let i = 0; i < bucket.ch.length; i += 1) {
          context.fillText(bucket.ch[i], bucket.x[i], bucket.y[i]);
        }
      });

      context.globalAlpha = 1;
    };

    const drawNow = () => {
      draw(
        reducedMotion.matches ? stillTime : (performance.now() - start) / 1000,
      );
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);

      if (now - lastFrame < FRAME_INTERVAL) {
        return;
      }

      lastFrame = now;
      draw((now - start) / 1000);
    };

    const sync = () => {
      const shouldRun = visible && !document.hidden && !reducedMotion.matches;

      if (shouldRun && !frame) {
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }

      if (!shouldRun) {
        drawNow();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.font = font;
      cellWidth = context.measureText("M").width || fontSize * 0.6;
      grid.cols = Math.ceil(width / cellWidth);
      grid.rows = Math.ceil(height / lineHeight);
      drawNow();
    };

    const refreshPalette = () => {
      palette = readPalette(canvas);
      drawNow();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();

      if (event.clientY < rect.top || event.clientY > rect.bottom) {
        return;
      }

      pointer = { x: clamp01((event.clientX - rect.left) / rect.width) };
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const themeObserver = new MutationObserver(refreshPalette);

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
    });
    colorScheme.addEventListener("change", refreshPalette);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    void document.fonts.ready.then(resize);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      colorScheme.removeEventListener("change", refreshPalette);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
    };
  }, [fontSize, lineHeight, render, stillTime]);

  return <canvas aria-hidden="true" className={className} ref={canvasRef} />;
}

// The sea is drawn side-on as layered swells: small, faint and slow near
// the horizon, tall, bright and quicker up front. Each nearer layer hides the
// one behind it, which is what makes the motion read as rolling water.
const seaLayers = 7;
// The line sits high in the cell with "-" and low with "_", which keeps
// curves smooth without the dotted look of finer glyph steps.
const surfaceChars = ["-", "_"];

let seaCells: {
  alpha: Float32Array;
  char: string[];
  glint: Uint8Array;
} | null = null;
let glintCenter = 0.62;

function swellHeight(col: number, layer: number, time: number) {
  const depth = layer / (seaLayers - 1);
  const wavelength = 16 + 64 * depth;
  const speed = 2.5 + 8 * depth;
  const theta = ((col - time * speed) / wavelength) * Math.PI * 2 + layer * 1.7;
  // Raising the sine to a power sharpens crests and flattens troughs.
  const crest = Math.pow((Math.sin(theta) + 1) / 2, 1.7);
  const swell = Math.sin(
    ((col + time * speed * 0.4) / (wavelength * 2.9)) * Math.PI * 2 + layer,
  );

  return { crest, height: crest * 2 - 1 + swell * 0.45 };
}

const renderSea: AsciiRenderer = ({ cols, rows }, time, put, pointer) => {
  const size = cols * rows;

  if (!seaCells || seaCells.char.length !== size) {
    seaCells = {
      alpha: new Float32Array(size),
      char: new Array<string>(size),
      glint: new Uint8Array(size),
    };
  }

  const cells = seaCells;
  cells.alpha.fill(0);
  cells.char.fill(" ");
  cells.glint.fill(0);

  const set = (
    col: number,
    row: number,
    char: string,
    alpha: number,
    glint = 0,
  ) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
      return;
    }

    const index = row * cols + col;
    cells.char[index] = char;
    cells.alpha[index] = alpha;
    cells.glint[index] = glint;
  };

  // The reflected light path eases toward the pointer, like a low sun
  // following you along the shore.
  glintCenter += ((pointer?.x ?? 0.62) - glintCenter) * 0.025;

  for (let layer = 0; layer < seaLayers; layer += 1) {
    const depth = layer / (seaLayers - 1);
    const baseRow = rows * (0.16 + 0.66 * Math.pow(depth, 1.15));
    const amplitude = 0.35 + 2.3 * Math.pow(depth, 1.4);
    const lineAlpha = 0.22 + 0.62 * depth;
    const glintWidth = 0.03 + 0.09 * depth;
    const surface: number[] = [];

    for (let col = -1; col <= cols; col += 1) {
      surface.push(baseRow - swellHeight(col, layer, time).height * amplitude);
    }

    for (let col = 0; col < cols; col += 1) {
      const y = surface[col + 1];
      const row = Math.floor(y);
      const { crest } = swellHeight(col, layer, time);

      // Water below this swell's surface covers the layers behind it.
      for (let below = row + 1; below < rows; below += 1) {
        const fall = below - y;
        const speck =
          hash(col, below, Math.floor(time * 0.8 + hash(col, below) * 4)) >
          0.93 - depth * 0.04;
        set(
          col,
          below,
          speck ? "." : " ",
          speck ? lineAlpha * 0.35 * Math.max(0, 1 - fall / 6) : 0,
        );
      }

      // Connect steep faces so the line never breaks into dots.
      const left = surface[col];
      const right = surface[col + 2];
      const slope = right - left;

      if (Math.abs(slope) > 1.6) {
        const from = Math.ceil(Math.min(left, right, y));
        const to = Math.floor(Math.max(left, right, y));

        for (let fill = from; fill < to; fill += 1) {
          if (fill !== row) {
            set(col, fill, slope < 0 ? "/" : "\\", lineAlpha * 0.8);
          }
        }
      }

      const offset = (col / cols - glintCenter) / glintWidth;
      const glintPath = Math.exp(-offset * offset);
      const sparkle = hash(
        col,
        layer,
        Math.floor(time * 4 + hash(col, layer) * 4),
      );
      const lit = glintPath > 0.3 && sparkle > 0.35 && depth > 0.15;
      const frac = y - row;
      let char = surfaceChars[frac < 0.55 ? 0 : 1];

      if (crest > 0.82 && char === "-") {
        char = "~";
      }

      set(
        col,
        row,
        lit && sparkle > 0.94 ? "*" : char,
        lit ? 0.6 + 0.4 * glintPath : lineAlpha * (0.75 + crest * 0.25),
        lit ? 1 : 0,
      );

      // Foam lifts off the nearest crests.
      if (
        depth > 0.5 &&
        crest > 0.94 &&
        hash(col, layer, Math.floor(time * 3)) > 0.55
      ) {
        set(col, row - 1, hash(col, row) > 0.5 ? "." : "'", 0.7 * depth, 1);
      }
    }
  }

  for (let index = 0; index < size; index += 1) {
    if (cells.alpha[index] > 0) {
      put(
        index % cols,
        Math.floor(index / cols),
        cells.char[index],
        cells.alpha[index],
        cells.glint[index] === 1,
      );
    }
  }
};

const renderSeabed: AsciiRenderer = ({ cols, rows }, time, put) => {
  const sandTops: number[] = [];

  for (let col = 0; col < cols; col += 1) {
    const dune =
      Math.sin(col * 0.035 + 1.2) * 1.1 + Math.sin(col * 0.11 + 0.4) * 0.45;
    sandTops.push(rows - 4 + Math.round(dune));
  }

  // Marine snow: a sparse drift of particles settling toward the sand.
  const flakes = Math.floor(cols / 7);

  for (let index = 0; index < flakes; index += 1) {
    const speed = 0.012 + hash(index, 4) * 0.02;
    const fall = fract(hash(index, 2) + time * speed);
    const col = Math.floor(
      fract(hash(index, 1) + Math.sin(time * 0.15 + index) * 0.004) * cols,
    );
    const row = Math.floor(fall * rows);

    if (row < sandTops[col] - 1) {
      put(col, row, ".", 0.18 + hash(index, 3) * 0.2 * (1 - fall));
    }
  }

  // Sand with caustic light bands drifting across it.
  for (let col = 0; col < cols; col += 1) {
    const top = sandTops[col];

    for (let row = Math.max(0, top); row < rows; row += 1) {
      const band =
        Math.sin(
          col * 0.16 + Math.sin(col * 0.045 + time * 0.35) * 2.2 + time * 0.42,
        ) + Math.sin(col * 0.09 - time * 0.31 + row * 0.7);
      const caustic = Math.pow(clamp01(1 - Math.abs(band) * 0.9), 3);
      const depth = row - top;
      const ripple = Math.sin(
        col * 0.6 + row * 1.9 + Math.sin(col * 0.08) * 2.4,
      );
      const char =
        depth === 0
          ? ripple > 0.35
            ? "~"
            : "_"
          : ripple > 0.5
            ? ":"
            : hash(col, row) > 0.5
              ? "."
              : ",";
      put(
        col,
        row,
        char,
        (0.3 + 0.35 * hash(col, row, 3)) * (1 - depth * 0.12) + caustic * 0.35,
        caustic > 0.6,
      );
    }
  }

  // Seagrass anchored in the sand, bending with a slow current.
  let lastStalk = -4;

  for (let col = 2; col < cols - 2; col += 1) {
    // Blades grow in meadows separated by open sand.
    const meadow = Math.max(
      0,
      Math.sin(col * 0.075 + 2) * Math.sin(col * 0.021 + 0.5),
    );

    if (hash(col, 7) > meadow * 1.6 || col - lastStalk < 2) {
      continue;
    }

    lastStalk = col;
    const stalkHeight =
      2 + Math.floor((0.35 + 0.65 * hash(col, 3)) * meadow * rows * 0.75);
    const base = sandTops[col];
    let previous = 0;

    for (let segment = 1; segment <= stalkHeight; segment += 1) {
      const bend =
        Math.sin(time * 0.75 + col * 0.37 + segment * 0.45) *
          0.2 *
          Math.pow(segment, 1.1) +
        Math.sin(time * 0.22 + col * 0.013) * 0.14 * segment;
      const delta = bend - previous;
      previous = bend;
      const char =
        segment === stalkHeight
          ? "'"
          : Math.abs(delta) < 0.18
            ? "|"
            : delta > 0
              ? "/"
              : "\\";
      put(
        col + Math.round(bend),
        base - segment,
        char,
        (0.62 - (segment / stalkHeight) * 0.3) * (0.7 + hash(col, 9) * 0.3),
      );
    }
  }

  // Bubbles let loose from the sand now and then, wobbling as they rise.
  const bubbles = Math.max(2, Math.floor(cols / 36));

  for (let index = 0; index < bubbles; index += 1) {
    const period = 6 + hash(index, 11) * 7;
    const cycle = time / period + hash(index, 12);
    const round = Math.floor(cycle);

    if (hash(index, round, 13) < 0.45) {
      continue;
    }

    const progress = fract(cycle);
    const sourceCol = Math.floor(hash(index, round, 14) * cols);
    const col = Math.round(sourceCol + Math.sin(progress * 11 + index) * 1.1);
    const row = Math.round(sandTops[sourceCol] - 1 - progress * (rows + 1));
    const char = progress < 0.25 ? "." : progress < 0.6 ? "o" : "O";

    if (row >= 0 && col >= 0 && col < cols) {
      put(col, row, char, 0.75 * (1 - progress * 0.7), true);
    }
  }
};

export function AsciiSea() {
  return (
    <div className="ascii-sea" aria-hidden="true">
      <AsciiCanvas
        className="ascii-canvas"
        fontSize={11}
        lineHeight={12}
        render={renderSea}
        stillTime={6}
      />
    </div>
  );
}

export function AsciiSeabed() {
  return (
    <div className="ascii-seabed" aria-hidden="true">
      <AsciiCanvas
        className="ascii-canvas"
        fontSize={11}
        lineHeight={13}
        render={renderSeabed}
        stillTime={8}
      />
    </div>
  );
}
