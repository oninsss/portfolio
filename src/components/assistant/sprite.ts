/**
 * The guide's pixel art, on a 14 x 14 grid. Rows are drawn top to bottom;
 * every letter is a colour role that globals.css maps to a theme token.
 *
 *   B body   L light edge   S shade   D visor   A antenna bulb   W eyes and mouth
 */
export const GRID = 14;

type Role = "B" | "L" | "S" | "D" | "A" | "W";
type Cell = readonly [x: number, y: number];

const BODY = [
  "......AA......",
  "..LLLLLLLLLL..",
  ".LLLLLLLLLLLS.",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBDDDDDDDDDDBS",
  "LBBBBBBBBBBBBS",
  "..SSSSSSSSSS..",
  "...SS....SS...",
  "...SS....SS...",
];

const EYES_OPEN: Cell[] = [
  [4, 4], [4, 5], [5, 4], [5, 5],
  [8, 4], [8, 5], [9, 4], [9, 5],
];
const EYES_SHUT: Cell[] = [[4, 5], [5, 5], [8, 5], [9, 5]];
const SMILE: Cell[] = [[5, 7], [8, 7], [6, 8], [7, 8]];
const GRIN: Cell[] = [[5, 7], [6, 7], [7, 7], [8, 7], [6, 8], [7, 8]];

export type PoseName =
  | "smile"
  | "happy"
  | "wink"
  | "wow"
  | "think"
  | "sleep"
  | "name";

export const POSES: Record<PoseName, { eyes: Cell[]; mouth: Cell[]; extra?: Cell[] }> = {
  smile: { eyes: EYES_OPEN, mouth: SMILE },
  happy: {
    eyes: [[3, 5], [4, 4], [5, 5], [8, 5], [9, 4], [10, 5]],
    mouth: GRIN,
  },
  wink: {
    eyes: [[4, 4], [4, 5], [5, 4], [5, 5], [8, 5], [9, 5]],
    mouth: GRIN,
  },
  wow: {
    eyes: EYES_OPEN,
    mouth: [[6, 7], [7, 7], [6, 8], [7, 8]],
    extra: [[4, 3], [5, 3], [8, 3], [9, 3]],
  },
  think: {
    eyes: [[5, 4], [5, 5], [6, 4], [6, 5], [9, 4], [9, 5], [10, 4], [10, 5]],
    mouth: [[7, 8], [8, 8]],
  },
  sleep: {
    eyes: EYES_SHUT,
    mouth: [[6, 8], [7, 8]],
    extra: [[11, 1], [12, 1], [12, 2], [11, 3], [12, 3]],
  },
  name: { eyes: [], mouth: [] },
};

/** Shown for a moment now and then, in place of open eyes. */
export const BLINK: Cell[] = EYES_SHUT;
/** Alternates with the pose's mouth while the guide is talking. */
export const TALK: Cell[] = [[6, 7], [7, 7], [6, 8], [7, 8]];

const arm = (x: number, top: number): Cell[] => [
  [x, top],
  [x, top + 1],
  [x, top + 2],
];

export const ARMS = {
  restLeft: arm(0, 6),
  restRight: arm(13, 6),
  upLeft: arm(0, 3),
  upRight: arm(13, 3),
  highRight: arm(13, 2),
};

/** One SVG path per colour role: every horizontal run of pixels becomes one rectangle. */
export function pathOf(cells: readonly Cell[]): string {
  const rows = new Map<number, number[]>();
  for (const [x, y] of cells) rows.set(y, [...(rows.get(y) ?? []), x]);
  let d = "";
  for (const [y, xs] of [...rows].sort((a, b) => a[0] - b[0])) {
    xs.sort((a, b) => a - b);
    let start = xs[0];
    let prev = xs[0];
    for (const x of [...xs.slice(1), Infinity]) {
      if (x !== prev + 1) {
        d += `M${start} ${y}h${prev - start + 1}v1h-${prev - start + 1}z`;
        start = x;
      }
      prev = x;
    }
  }
  return d;
}

function bodyPaths(): Record<Exclude<Role, "W">, string> {
  const cells: Record<string, Cell[]> = { B: [], L: [], S: [], D: [], A: [] };
  BODY.forEach((row, y) => {
    [...row].forEach((role, x) => {
      if (role !== "." && cells[role]) cells[role].push([x, y]);
    });
  });
  return {
    B: pathOf(cells.B),
    L: pathOf(cells.L),
    S: pathOf(cells.S),
    D: pathOf(cells.D),
    A: pathOf(cells.A),
  };
}

export const BODY_PATHS = bodyPaths();
