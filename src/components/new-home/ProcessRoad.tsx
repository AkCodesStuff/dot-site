"use client";

import gsap from "gsap";
import { useEffect, useId, useRef, useState } from "react";

import {
  buildTimeline,
  ROADS,
  SEQUENCE,
  WIDE_QUERY,
} from "@/components/new-home/config";
import { SERVICES } from "@/components/new-home/ServicesBand";

const TITLE = "Our process";

/** Share of the truck art's width the road takes, so the truck sits on it. */
const ROAD_TO_TRUCK = 0.85;
/**
 * The truck art inside its square box: about 23% of the box wide and 94% of
 * it tall (see `SEQUENCE.truck`).
 */
const ART_WIDTH = 0.23;

type Pt = { x: number; y: number };

type Geometry = {
  /** The road's two edges, as one run from the left edge round and up. */
  edges: string[];
  /** Its centre line, which the title is set along. */
  centre: string;
  /** Length of the straight run up the truck's lane, at the end of `centre`. */
  lane: number;
  /** Where the edges fade out, at the far end of that lane. */
  fade: { from: number; to: number };
  fontSize: number;
  /** Where along the centre line the title starts, px. */
  textStart: number;
};

/**
 * ============================================================================
 * PROCESS ROAD
 * ============================================================================
 * Desktop only. A road painted onto the road network, with the title set
 * along it like a road marking: it runs in from the left edge, turns up into
 * the lane the truck is holding for the process beat, and carries on up the
 * lane ahead of it.
 *
 * It has no animation of its own. It is placed by exactly the rule that places
 * the network (see `RoadNetwork`), so it rides the map down the screen as you
 * scroll — dropping in from above the frame as the process beat opens,
 * sliding past the truck, and leaving at the bottom. The only choice is where
 * on the map it is painted, and that is `SEQUENCE.process.road.at`: the point
 * in the beat at which the title crosses the middle of the screen.
 */
export function ProcessRoad() {
  const svgRef = useRef<SVGSVGElement>(null);
  const moveRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const centreRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [dashes, setDashes] = useState("");
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const pathId = `process-road-${id}`;
  const fadeId = `process-road-fade-${id}`;

  // Lay the road out against the stage and the truck's box, and track it
  // against the network every frame.
  useEffect(() => {
    const svg = svgRef.current;
    const move = moveRef.current;
    const stage = svg?.parentElement?.parentElement;
    const section = stage?.closest("section");
    const truck = stage?.querySelector<HTMLElement>("[data-truck-body]");
    if (!svg || !move || !stage || !section || !truck) return;

    // Scroll position at which the title crosses mid-screen.
    let crossing = 0;

    const measure = () => {
      const width = svg.clientWidth;
      const height = svg.clientHeight;
      if (!width || !height) return;
      const plan = buildTimeline(
        window.matchMedia(WIDE_QUERY).matches,
        SERVICES.length,
      );
      crossing =
        (plan.start.process +
          plan.duration.process * SEQUENCE.process.road.at) *
        window.innerHeight;
      setGeometry(layout(width, height, truck.offsetHeight));
    };

    // The network's own offset rule, so the two can never drift apart:
    // `parallax × |scrollY − p|`, where `p` is where the pin releases.
    const offset = (scroll: number) =>
      ROADS.parallax *
      Math.abs(scroll - (section.offsetHeight - stage.offsetHeight));

    let written = Number.NaN;
    const track = () => {
      const ty =
        offset(crossing) -
        offset(window.scrollY) -
        stage.getBoundingClientRect().top;
      const rounded = Math.round(ty * 10) / 10;
      if (rounded === written) return;
      written = rounded;
      move.setAttribute("transform", `translate(0 ${rounded})`);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    observer.observe(truck);
    // Ahead of GSAP's own update: this reads only scroll and layout, and the
    // network's text clearing (run after GSAP) then sees the title in place.
    gsap.ticker.add(track, false, true);
    return () => {
      observer.disconnect();
      gsap.ticker.remove(track);
    };
  }, []);

  // The lane dashes run from just past the title to the turn, so they wait
  // for the title to be set (and its font to land) to know where it ends.
  useEffect(() => {
    if (!geometry) return;
    let live = true;
    const place = () => {
      const text = textRef.current;
      const centre = centreRef.current;
      if (!live || !text || !centre) return;
      const to = centre.getTotalLength() - geometry.lane;
      const from =
        geometry.textStart +
        text.getComputedTextLength() +
        geometry.fontSize * 0.9;
      const points: string[] = [];
      for (let at = from; at <= to; at += 6) {
        const p = centre.getPointAtLength(at);
        points.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      }
      setDashes(points.length > 1 ? `M${points.join("L")}` : "");
    };
    place();
    document.fonts.ready.then(place);
    return () => {
      live = false;
    };
  }, [geometry]);

  const g = geometry;

  return (
    <>
      <h2 className="sr-only" data-road-ignore>
        {TITLE}
      </h2>
      <svg
        ref={svgRef}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <path ref={centreRef} id={pathId} d={g?.centre ?? ""} />
          {/* The lane runs on out of sight ahead of the truck, so it fades
              rather than stopping dead. */}
          <linearGradient
            id={fadeId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1={g?.fade.from ?? 0}
            y2={g?.fade.to ?? 0}
          >
            <stop offset="0" stopOpacity="0" className="[stop-color:var(--on-primary)]" />
            <stop offset="1" stopOpacity="1" className="[stop-color:var(--on-primary)]" />
          </linearGradient>
        </defs>

        <g ref={moveRef}>
          <g fill="none" strokeWidth="1.5" strokeOpacity="0.35" stroke={`url(#${fadeId})`}>
            {g?.edges.map((d, index) => <path key={index} d={d} />)}
          </g>

          <text
            ref={textRef}
            // Clears the background network around the title, like any copy.
            data-road-clear
            className="fill-on-primary font-headline"
            fontSize={g?.fontSize ?? 0}
            fontWeight={700}
            letterSpacing="0.16em"
            dominantBaseline="central"
          >
            <textPath href={`#${pathId}`} startOffset={g?.textStart ?? 0}>
              {TITLE.toUpperCase()}
            </textPath>
          </text>

          {/* The lane marking, in the brand yellow a road would paint it. */}
          <path
            d={dashes}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={
              g ? `${g.fontSize * 0.3} ${g.fontSize * 0.45}` : undefined
            }
            className="stroke-accent/70"
          />
        </g>
      </svg>
    </>
  );
}

/**
 * The road at rest: title row across the middle of the stage, as it stands
 * when it crosses mid-screen. The tracker moves it from there.
 */
function layout(width: number, height: number, truckBox: number): Geometry {
  const art = truckBox * ART_WIDTH;
  const road = Math.round(art * ROAD_TO_TRUCK);
  const half = road / 2;
  const overrun = 60;
  const margin = width * 0.06;

  // The truck's lane for this beat, and the title row across the middle.
  const laneX = width * (0.5 - SEQUENCE.process.truckShift);
  const row = height / 2;
  const turn = road * 1.1;
  const lane = height * 1.2;

  // In at the screen edge with a gentle bend, then dead level — so the title
  // reads straight — round a quarter turn, and up the truck's lane.
  const dip = road * 0.35;
  const start = { x: -overrun, y: row + dip };
  const level = { x: margin * 0.8, y: row };
  const corner = { x: laneX - turn, y: row };
  const samples: Pt[] = [];
  for (let i = 0; i <= 16; i += 1) {
    const mid = lerp(start.x, level.x, 0.5);
    samples.push(
      bezier(start, { x: mid, y: start.y }, { x: mid, y: level.y }, level, i / 16),
    );
  }
  for (let i = 1; i <= 16; i += 1) {
    samples.push({ x: lerp(level.x, corner.x, i / 16), y: row });
  }
  for (let i = 1; i <= 16; i += 1) {
    const angle = (Math.PI / 2) * (i / 16);
    samples.push({
      x: corner.x + turn * Math.sin(angle),
      y: row - turn + turn * Math.cos(angle),
    });
  }
  const top = row - turn - lane;
  for (let i = 1; i <= 8; i += 1) {
    samples.push({ x: laneX, y: lerp(row - turn, top, i / 8) });
  }

  const f = (p: Pt) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  const polyline = (pts: Pt[]) => `M${pts.map(f).join("L")}`;
  const offset = (by: number) =>
    samples.map((p, i) => {
      const a = samples[Math.max(i - 1, 0)];
      const b = samples[Math.min(i + 1, samples.length - 1)];
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return {
        x: p.x - ((b.y - a.y) / len) * by,
        y: p.y + ((b.x - a.x) / len) * by,
      };
    });

  // The title starts on the page's own margin and ends well short of the
  // turn, so it never runs under the truck.
  let textStart = 0;
  for (let i = 1; i < samples.length && samples[i].x < margin; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    textStart += Math.hypot(b.x - a.x, b.y - a.y);
  }
  const room = corner.x - 40 - margin;
  // ~8.2em for eleven capitals at this weight and tracking.
  const fontSize = Math.max(14, Math.min(road * 0.36, room / 8.2, 46));

  return {
    edges: [polyline(offset(-half)), polyline(offset(half))],
    centre: polyline(samples),
    lane,
    fade: { from: top, to: top + lane * 0.6 },
    fontSize,
    textStart,
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}
