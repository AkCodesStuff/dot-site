import { ROADS } from "@/components/new-home/config";

/**
 * ============================================================================
 * ROAD NETWORK GENERATOR
 * ============================================================================
 * Pure geometry: given a width, a band height (one viewport) and a number of
 * bands, lays out a seeded network in page-space pixels. `RoadNetwork.tsx`
 * renders it and handles parallax, theming and masking.
 *
 * Built band by band, each band on its own seeded stream, so a taller page
 * only adds bands at the bottom rather than reshuffling the ones above.
 *
 * - One trunk highway meanders down the full length of the page.
 * - Each band gets 0–1 cross-country highways and two or three edge-to-edge
 *   secondary roads, spread down the band so they never bunch up.
 * - Connectors join two of those horizontals, sometimes skipping one, which is
 *   where roads cross. Spurs run in from a screen edge to meet a connector or
 *   the trunk. Both end ON another road, never in the open.
 * - Depots sit on a share of those junctions and trunk crossings.
 *
 * Every road is a Catmull-Rom curve through a few anchors, emitted as cubic
 * Béziers. Highways are drawn twice, offset either side of the centre line
 * along its normals, which keeps the pair parallel through the bends.
 */

export type RoadPath = { d: string; major: boolean };
export type Depot = { x: number; y: number; r: number };
export type Network = { roads: RoadPath[]; depots: Depot[] };

type Pt = { x: number; y: number };
/** A drawn road plus a dense sampling of it, for finding points along it. */
type Line = { samples: Pt[]; axis: "x" | "y" };

/** How far roads run past the screen edges, so no end is ever seen. */
const OVERRUN = 60;

function seeded(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = ReturnType<typeof seeded>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const between = (rand: Rand, [lo, hi]: readonly number[]) =>
  lo + (hi - lo) * rand();
/** Scales a count by density, rounding the remainder up at random. */
const scaled = (rand: Rand, count: number, density: number) => {
  const exact = count * density;
  return Math.floor(exact) + (rand() < exact % 1 ? 1 : 0);
};

type Segment = [Pt, Pt, Pt, Pt];

function toSegments(pts: Pt[]): Segment[] {
  const out: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    out.push([
      p1,
      { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p2,
    ]);
  }
  return out;
}

const f = (n: number) => n.toFixed(1);

function toD(segments: Segment[]) {
  const [start] = segments[0];
  return (
    `M${f(start.x)} ${f(start.y)}` +
    segments
      .map(
        ([, c1, c2, p]) =>
          `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p.x)} ${f(p.y)}`,
      )
      .join("")
  );
}

function sample(segments: Segment[], steps = 12): Pt[] {
  const out: Pt[] = [segments[0][0]];
  for (const [p0, p1, p2, p3] of segments) {
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      out.push({
        x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
        y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
      });
    }
  }
  return out;
}

/** The anchors shifted `by` px along the curve's normal at each one. */
function offset(pts: Pt[], by: number): Pt[] {
  return pts.map((p, i) => {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: p.x - ((b.y - a.y) / len) * by, y: p.y + ((b.x - a.x) / len) * by };
  });
}

/**
 * The point on `line` whose coordinate along its main axis is `v`, or null if
 * the line never gets there. Samples are monotonic along that axis by
 * construction, so this is a binary search plus a lerp.
 */
function pointAt(line: Line, v: number): Pt | null {
  const { samples, axis } = line;
  const key = (p: Pt) => (axis === "x" ? p.x : p.y);
  if (v < key(samples[0]) || v > key(samples[samples.length - 1])) return null;
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (key(samples[mid]) < v) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const t = (v - key(a)) / (key(b) - key(a) || 1);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function buildNetwork(
  width: number,
  band: number,
  bands: number,
  density: number,
): Network {
  const roads: RoadPath[] = [];
  const depots: Depot[] = [];
  const height = band * bands;

  const addRoad = (pts: Pt[], axis: Line["axis"], major = false): Line => {
    const segments = toSegments(pts);
    if (major) {
      const half = ROADS.highwayGap / 2;
      roads.push({ d: toD(toSegments(offset(pts, -half))), major: true });
      roads.push({ d: toD(toSegments(offset(pts, half))), major: true });
    } else {
      roads.push({ d: toD(segments), major: false });
    }
    return { samples: sample(segments), axis };
  };

  const depot = (rand: Rand, p: Pt | null) => {
    if (!p || rand() >= ROADS.depotChance) return;
    depots.push({ x: p.x, y: p.y, r: between(rand, ROADS.depotRadius) });
  };

  // --- The trunk: one highway down the whole page -------------------------
  const trunkRand = seeded(ROADS.seed ^ 0x2545f491);
  const trunkPts: Pt[] = [];
  const trunkStep = band * 0.45;
  let tx = width * lerp(0.2, 0.8, trunkRand());
  for (let y = -OVERRUN; y < height + trunkStep; y += trunkStep) {
    trunkPts.push({ x: tx, y });
    tx = clamp(tx + (trunkRand() - 0.5) * 0.4 * width, width * 0.1, width * 0.9);
  }
  const trunk = addRoad(trunkPts, "y", true);

  // Anchors across a horizontal road: enough to bend, never enough to wiggle.
  const across = Math.max(3, Math.round(width / 340));
  const horizontal = (rand: Rand, y0: number, y1: number): Pt[] => {
    const pts: Pt[] = [];
    const span = width + OVERRUN * 2;
    for (let i = 0; i <= across; i += 1) {
      const jitter = i === 0 || i === across ? 0 : (rand() - 0.5) * 0.5;
      const t = (i + jitter) / across;
      pts.push({
        x: -OVERRUN + span * t,
        y: lerp(y0, y1, t) + (rand() - 0.5) * band * 0.1,
      });
    }
    return pts;
  };

  const horizontals: { line: Line; y: number }[] = [];

  for (let b = 0; b < bands; b += 1) {
    const rand = seeded(ROADS.seed + b * 7919);
    const top = b * band;

    // --- Horizontals: highways and edge-to-edge secondaries --------------
    const highways = scaled(
      rand,
      Math.max(0, Math.round(between(rand, ROADS.highwaysPerViewport)) - 1),
      density,
    );
    const total = scaled(
      rand,
      Math.round(between(rand, ROADS.roadsPerViewport)),
      density,
    );
    const edgeRoads = Math.min(total, density < 1 ? 1 + (rand() < 0.5 ? 1 : 0) : 2 + (rand() < 0.4 ? 1 : 0));
    const slots = highways + edgeRoads;
    const majorSlot = highways ? Math.floor(rand() * slots) : -1;

    for (let i = 0; i < slots; i += 1) {
      const y = top + (band * (i + 0.2 + 0.6 * rand())) / slots;
      const slope = (rand() - 0.5) * band * 0.24;
      const line = addRoad(
        horizontal(rand, y - slope / 2, y + slope / 2),
        "x",
        i === majorSlot,
      );
      horizontals.push({ line, y });

      // Where the trunk crosses it, refined twice to land on both curves.
      let cross = pointAt(trunk, y);
      for (let k = 0; k < 2 && cross; k += 1) {
        const onRoad = pointAt(line, cross.x);
        cross = onRoad ? pointAt(trunk, onRoad.y) : null;
      }
      depot(rand, cross);
    }

    // --- Connectors: vertical-ish roads between two horizontals ----------
    const rest = total - edgeRoads;
    const connectorCount = Math.ceil(rest * 0.55);
    const verticals: Line[] = [trunk];
    const nearby = horizontals.filter(
      (h) => h.y > top - band && h.y < top + band * 1.2,
    );

    for (let i = 0, tries = 0; i < connectorCount && tries < 40; tries += 1) {
      const a = nearby[Math.floor(rand() * nearby.length)];
      const c = nearby[Math.floor(rand() * nearby.length)];
      if (!a || !c) break;
      const [upper, lower] = a.y < c.y ? [a, c] : [c, a];
      const gap = lower.y - upper.y;
      if (gap < band * 0.18 || gap > band) continue;

      const x1 = width * lerp(0.06, 0.94, rand());
      const x2 = clamp(x1 + (rand() - 0.5) * 0.5 * width, width * 0.04, width * 0.96);
      const p = pointAt(upper.line, x1);
      const q = pointAt(lower.line, x2);
      if (!p || !q) continue;

      const sway = () => (rand() - 0.5) * 0.12 * width;
      const pts = [
        p,
        { x: lerp(p.x, q.x, 1 / 3) + sway(), y: lerp(p.y, q.y, 1 / 3) },
        { x: lerp(p.x, q.x, 2 / 3) + sway(), y: lerp(p.y, q.y, 2 / 3) },
        q,
      ];
      verticals.push(addRoad(pts, "y"));
      depot(rand, p);
      depot(rand, q);
      i += 1;
    }

    // --- Spurs: in from a screen edge to meet a vertical -----------------
    const spurCount = rest - connectorCount;
    for (let i = 0, tries = 0; i < spurCount && tries < 30; tries += 1) {
      const fromLeft = rand() < 0.5;
      const y = top + band * lerp(0.05, 0.95, rand());
      const target = verticals[Math.floor(rand() * verticals.length)];
      const end = target && pointAt(target, y);
      if (!end) continue;
      const reach = fromLeft ? end.x : width - end.x;
      if (reach < width * 0.12 || reach > width * 0.6) continue;

      const startX = fromLeft ? -OVERRUN : width + OVERRUN;
      const start = { x: startX, y: y + (rand() - 0.5) * band * 0.12 };
      const mid = {
        x: lerp(startX, end.x, 0.5),
        y: lerp(start.y, end.y, 0.5) + (rand() - 0.5) * band * 0.08,
      };
      addRoad(fromLeft ? [start, mid, end] : [end, mid, start], "x");
      depot(rand, end);
      i += 1;
    }
  }

  return { roads, depots };
}
