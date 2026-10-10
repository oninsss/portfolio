export type Point = { x: number; y: number };

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (progress: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const at = (a: number, b: number, c: number, t: number) =>
    ((a * t + b) * t + c) * t;

  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = progress;
    for (let i = 0; i < 24; i += 1) {
      t = (lo + hi) / 2;
      if (at(ax, bx, cx, t) < progress) lo = t;
      else hi = t;
    }
    return at(ay, by, cy, t);
  };
}

const ease = cubicBezier(0.4, 0, 0.2, 1);

export function legDuration(
  distance: number,
  min: number,
  max: number,
): number {
  return clamp(distance * 0.45, min, max);
}

export type TravelSpec = {
  from: Point;
  scrollFrom: number;
  scrollTo: number;
  target: (scrollY: number) => Point;
  duration: number;
  instant?: boolean;
  alive?: () => boolean;
  apply: (point: Point) => void;
  onDone: (outcome: "landed" | "interrupted") => void;
};

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

export function travel(spec: TravelSpec): void {
  const {
    from,
    scrollFrom,
    scrollTo,
    target,
    duration: ms,
    instant,
    alive,
    apply,
    onDone,
  } = spec;

  const scrolls = Math.abs(scrollTo - scrollFrom) > 0.5;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  if (scrolls) root.style.scrollBehavior = "auto";

  const stillGoing = () => (alive ? alive() : true);

  let interrupted = false;
  const listen = scrolls && !instant;
  const take = () => {
    interrupted = true;
  };
  const takeKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) interrupted = true;
  };
  if (listen) {
    window.addEventListener("wheel", take, { passive: true });
    window.addEventListener("touchstart", take, { passive: true });
    window.addEventListener("keydown", takeKey);
  }

  const finish = (outcome: "landed" | "interrupted" | "cancelled") => {
    root.style.scrollBehavior = previousBehavior;
    if (listen) {
      window.removeEventListener("wheel", take);
      window.removeEventListener("touchstart", take);
      window.removeEventListener("keydown", takeKey);
    }
    if (outcome !== "cancelled") onDone(outcome);
  };

  const frame = (eased: number) => {
    const scrollY = scrollFrom + (scrollTo - scrollFrom) * eased;
    if (
      scrolls &&
      (eased >= 1 || Math.abs(scrollY - window.scrollY) > 0.5)
    ) {
      window.scrollTo({ top: scrollY, behavior: "instant" });
    }
    const aim = target(scrollY);
    apply({
      x: from.x + (aim.x - from.x) * eased,
      y: from.y + (aim.y - from.y) * eased,
    });
  };

  if (instant) {
    if (!stillGoing()) return finish("cancelled");
    frame(1);
    return finish("landed");
  }

  const start = performance.now();

  const step = (now: number) => {
    if (!stillGoing()) return finish("cancelled");
    if (interrupted) return finish("interrupted");
    const p = clamp((now - start) / ms, 0, 1);
    frame(ease(p));
    if (p < 1) {
      requestAnimationFrame(step);
      return;
    }
    finish("landed");
  };

  requestAnimationFrame(step);
}

export type GlideSpec = {
  from: Point;
  to: Point;
  duration: number;
  instant?: boolean;
  alive?: () => boolean;
  apply: (point: Point) => void;
  onDone: () => void;
};

export function glide(spec: GlideSpec): void {
  const { from, to, duration: ms, instant, alive, apply, onDone } = spec;
  const stillGoing = () => (alive ? alive() : true);

  if (instant) {
    if (!stillGoing()) return;
    apply(to);
    return onDone();
  }

  const start = performance.now();
  const step = (now: number) => {
    if (!stillGoing()) return;
    const p = clamp((now - start) / ms, 0, 1);
    const eased = ease(p);
    apply({
      x: from.x + (to.x - from.x) * eased,
      y: from.y + (to.y - from.y) * eased,
    });
    if (p < 1) {
      requestAnimationFrame(step);
      return;
    }
    onDone();
  };

  requestAnimationFrame(step);
}
