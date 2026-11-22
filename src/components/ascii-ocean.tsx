import { useEffect, useRef } from "react";

type Grid = {
  cols: number;
  rows: number;
};

type Pointer = {
  /** Pointer position across the canvas, 0 to 1 on each axis. */
  x: number;
  y: number;
  /** Recent pointer movement, 0 when still and up to 1 when swept fast. */
  energy: number;
  inside: boolean;
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
    const pointerState: Pointer = { energy: 0, inside: false, x: 0.5, y: 0.5 };
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

      // Movement energy fades over about a second after the pointer stops.
      pointerState.energy *= 0.93;
      const pointer =
        pointerState.inside || pointerState.energy > 0.01 ? pointerState : null;
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

      const inside =
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right;

      if (!inside) {
        pointerState.inside = false;
        return;
      }

      const x = clamp01((event.clientX - rect.left) / rect.width);
      const y = clamp01((event.clientY - rect.top) / rect.height);

      if (pointerState.inside) {
        const travel = Math.hypot(
          (x - pointerState.x) * rect.width,
          (y - pointerState.y) * rect.height,
        );
        pointerState.energy = Math.min(1, pointerState.energy + travel / 160);
      }

      pointerState.x = x;
      pointerState.y = y;
      pointerState.inside = true;

      if (!frame) {
        drawNow();
      }
    };

    const onPointerLeave = () => {
      pointerState.inside = false;
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

// The sea is a field of wave lines in perspective: short, faint chop near
// the horizon and long, bright swells up front, each nearer line hiding the
// ones behind it. Every line mixes waves travelling in both directions, so
// crests swell and sink in place the way water bobs, instead of one fixed
// profile sliding sideways like scrolling terrain.
type SeaLayer = {
  alpha: number;
  amplitude: number;
  base: number;
  speed: number;
  steepness: number;
  wavelength: number;
};

const seaLayerCount = 9;
const seaLayers: SeaLayer[] = Array.from(
  { length: seaLayerCount },
  (_, index) => {
    const depth = index / (seaLayerCount - 1);

    return {
      alpha: 0.24 + 0.62 * depth,
      amplitude: 0.4 + 2.4 * Math.pow(depth, 1.5),
      base: 0.1 + 0.8 * Math.pow(depth, 1.35),
      speed: 1.6 + 4.4 * depth,
      steepness: 0.35 + 0.45 * depth,
      wavelength: 14 + 46 * depth,
    };
  },
);

// Per line: a main wave, a slightly shorter one running the other way (the
// pair makes crests rise and fall in place), and a long slow swell.
const swellComponents = [
  { phase: 0, share: 0.55, speed: 1, stretch: 1 },
  { phase: 1.1, share: 0.32, speed: -0.85, stretch: 0.77 },
  { phase: 2.3, share: 0.13, speed: 0.45, stretch: 2.6 },
];

let seaCells: {
  alpha: Float32Array;
  char: string[];
  glint: Uint8Array;
} | null = null;
let surface = new Float32Array(0);
let glintCenter = 0.62;

function gerstnerSurface(
  layer: SeaLayer,
  index: number,
  cols: number,
  time: number,
) {
  if (surface.length !== cols + 2) {
    surface = new Float32Array(cols + 2);
  }

  surface.fill(Number.NEGATIVE_INFINITY);

  // Each water particle moves in a circle; sampling particles densely and
  // keeping the highest one per column traces the visible surface.
  for (let u = -layer.wavelength; u < cols + layer.wavelength; u += 0.25) {
    let x = u;
    let height = 0;

    for (const component of swellComponents) {
      const k = (Math.PI * 2) / (layer.wavelength * component.stretch);
      const theta =
        k * (u - layer.speed * component.speed * time) +
        component.phase +
        index * 1.9;
      x -= ((layer.steepness * component.share) / k) * Math.sin(theta);
      height += component.share * Math.cos(theta);
    }

    const col = Math.round(x) + 1;

    if (col >= 0 && col < surface.length && height > surface[col]) {
      surface[col] = height;
    }
  }

  for (let col = 1; col < surface.length; col += 1) {
    if (surface[col] === Number.NEGATIVE_INFINITY) {
      surface[col] = surface[col - 1];
    }
  }

  return surface;
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
  glintCenter += ((pointer?.x ?? 0.62) - glintCenter) * 0.03;
  const pointerCol = pointer ? pointer.x * cols : 0;
  const pointerRow = pointer ? pointer.y * rows : 0;
  const ys = new Float32Array(cols + 2);

  seaLayers.forEach((layer, index) => {
    const heights = gerstnerSurface(layer, index, cols, time);
    const baseRow = rows * layer.base;
    const glintWidth = 0.03 + 0.012 * index;

    for (let col = 0; col < cols + 2; col += 1) {
      let y = baseRow - heights[col] * layer.amplitude;

      // Moving the pointer through the water sends ripples out from it,
      // strongest on the swell nearest the pointer.
      if (pointer && pointer.energy > 0.01) {
        const distance = Math.abs(col - 1 - pointerCol);
        const nearness = Math.exp(-(((baseRow - pointerRow) / 5) ** 2));
        y -=
          pointer.energy *
          nearness *
          2.2 *
          Math.exp(-distance / 14) *
          Math.cos(distance * 0.5 - time * 9);
      }

      ys[col] = y;
    }

    for (let col = 0; col < cols; col += 1) {
      const y = ys[col + 1];
      const row = Math.floor(y);
      const slope = (ys[col + 2] - ys[col]) / 2;
      const crest = (heights[col + 1] + 1) / 2;
      const whitecap = crest > 0.9 && layer.steepness > 0.55;

      // The water body: brightest just under the surface and on the face
      // turned to the light, with streaks that travel with the swell.
      for (let below = row + 1; below < rows; below += 1) {
        const depth = below - y;
        const facing = clamp01(0.55 + slope * 0.5);
        const shade =
          (0.35 + 0.65 * facing) *
          Math.exp(-depth / (0.9 + layer.amplitude * 0.45));
        const streak = Math.sin(
          (col - time * layer.speed * 0.6) * 0.33 +
            below * 2.1 +
            Math.sin(col * 0.06 + below) * 1.6,
        );
        const char =
          shade > 0.5
            ? streak > 0.15
              ? "~"
              : "-"
            : shade > 0.28
              ? streak > 0.35
                ? "-"
                : "."
              : shade > 0.12 && streak > 0.65
                ? "."
                : " ";
        set(
          col,
          below,
          char,
          char === " " ? 0 : layer.alpha * (0.2 + 0.55 * shade),
        );
      }

      // Steep faces get a joined edge so the crest line never breaks up.
      const left = ys[col];
      const right = ys[col + 2];

      if (Math.abs(right - left) > 1.6) {
        const from = Math.ceil(Math.min(left, right, y));
        const to = Math.floor(Math.max(left, right, y));

        for (let fill = from; fill < to; fill += 1) {
          if (fill !== row) {
            set(col, fill, right < left ? "/" : "\\", layer.alpha * 0.85);
          }
        }
      }

      const offset = (col / cols - glintCenter) / glintWidth;
      const glintPath = Math.exp(-offset * offset);
      const sparkle = hash(
        col,
        index,
        Math.floor(time * 4 + hash(col, index) * 4),
      );
      const lit = index > 0 && glintPath > 0.3 && sparkle > 0.35;
      const char = whitecap ? "~" : y - row < 0.55 ? "-" : "_";

      set(
        col,
        row,
        lit && sparkle > 0.94 ? "*" : char,
        whitecap || lit ? 0.75 + 0.25 * glintPath : layer.alpha,
        whitecap || lit ? 1 : 0,
      );

      // Spray lifts off the tallest crests.
      if (whitecap && hash(col, index, Math.floor(time * 3)) > 0.45) {
        set(col, row - 1, hash(col, row) > 0.5 ? "." : "'", 0.65, 1);
      }
    }
  });

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

const renderSeabed: AsciiRenderer = ({ cols, rows }, time, put, pointer) => {
  const sandTops: number[] = [];
  const pointerCol = pointer ? pointer.x * cols : -1000;
  const pointerRow = pointer ? pointer.y * rows : -1000;
  const presence = pointer?.inside ? 1 : 0;

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
      // Hovering casts a soft pool of light on the sand.
      const spotlight =
        presence *
        Math.exp(
          -((col - pointerCol) ** 2) / 90 - (row - pointerRow) ** 2 / 20,
        );
      const caustic = clamp01(
        Math.pow(clamp01(1 - Math.abs(band) * 0.9), 3) + spotlight * 0.8,
      );
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
        Math.sin(time * 0.22 + col * 0.013) * 0.14 * segment +
        // Blades lean away from the pointer and shiver when it sweeps by.
        Math.sign(col - pointerCol) *
          Math.exp(-Math.abs(col - pointerCol) / 7) *
          (presence * 0.3 + (pointer?.energy ?? 0) * 0.5) *
          segment;
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

  // A quick sweep shakes a few bubbles loose under the pointer.
  if (pointer && pointer.energy > 0.15) {
    for (let index = 0; index < 4; index += 1) {
      const progress = fract(time * 0.8 + index / 4);
      const col = Math.round(
        pointerCol + (hash(index, 21) - 0.5) * 6 + Math.sin(progress * 9) * 1.2,
      );
      const row = Math.round(pointerRow - progress * 6);
      const char = progress < 0.35 ? "." : progress < 0.7 ? "o" : "O";

      if (row >= 0 && col >= 0 && col < cols) {
        put(col, row, char, pointer.energy * (1 - progress) * 0.9, true);
      }
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
