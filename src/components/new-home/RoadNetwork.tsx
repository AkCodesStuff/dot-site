"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties, ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { MOBILE_QUERY, ROADS } from "@/components/new-home/config";
import { buildNetwork, type Network } from "@/components/new-home/road-network";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * ============================================================================
 * ROAD NETWORK
 * ============================================================================
 * The map texture behind the page. Conceptually one layer, the full height of
 * the page, moving at `ROADS.parallax` of scroll speed.
 *
 * WHICH WAY IT MOVES
 * The truck faces up the screen, so while its stage is pinned the roads flow
 * DOWN as you scroll — the ground passing under a truck driving forward.
 * Once the pin releases they turn round and drift up with the page like
 * ordinary parallax. With `p` the scroll distance at which the pin releases,
 * the whole network sits at
 *
 *     network y  =  screen y  +  parallax × |scrollY − p|
 *
 * which is falling before `p`, rising after it, and continuous through it.
 * Reduced motion drops all of that: the roads are fixed to the page.
 *
 * WHY IT IS DRAWN THROUGH WINDOWS
 * Every section on this page paints an opaque background, so a layer literally
 * behind them would never be seen. Instead the geometry is defined once (the
 * hidden `<svg>` below) and each section drops a `RoadLayer` in just above its
 * own background. Every layer places the network by that SAME rule, in
 * screen space, so wherever two sections meet their roads meet too, and the
 * whole thing reads as one sheet sliding under the page.
 *
 * The one exception is the services band, whose roads are painted onto the
 * band itself (`motion="attached"`): it covers the stage while the truck is
 * hidden, and a map running beneath it there only reads as motion for its
 * own sake.
 *
 * Each layer themes itself (dark ink on light sections, light ink on dark
 * ones; the truck stage cross-fades between them in step with its own
 * nightfall) and masks itself clear of every piece of text, logo and button
 * inside its section, re-measured every frame so it follows the animation.
 */

const GEOMETRY_ID = "road-network-geometry";

/**
 * `day` / `night` are fixed. `stage` follows the opacity of the section's
 * `[data-night]` layer, which the truck sequence fades up for its ending.
 */
type Theme = "day" | "night" | "stage";

/**
 * `page` follows the rule above. `drive` marks the pinned truck stage — its
 * section's extra height is `p`, where the roads turn round. `attached` holds
 * the network still relative to its own section.
 */
type Motion = "page" | "drive" | "attached";

/** Elements cleared as a whole box rather than text line by text line. */
const BLOCKS = "a, button, img, article, [data-clients], [data-road-clear]";
/** Never cleared: the truck is art the roads should run under, not text. */
const IGNORE = "[data-truck-body], [data-intro-truck], [data-road-ignore]";

type Hole = { x: number; y: number; w: number; h: number; a: number };

type Host = {
  svg: SVGSVGElement;
  scope: HTMLElement;
  theme: Theme;
  motion: Motion;
  /** Keeps its clearings to itself and ignores everyone else's. */
  isolated: boolean;
  move: SVGGElement;
  holes: SVGGElement;
  day: SVGUseElement | null;
  night: SVGUseElement | null;
  nightLayer: HTMLElement | null;
  /** Set by a MutationObserver; the candidate lists are rebuilt when true. */
  dirty: boolean;
  texts: Text[];
  blocks: Element[];
  /** Last values written, so an idle frame writes nothing. */
  written: { ty: number; night: number; holes: string };
};

type Registry = { add: (host: Host) => () => void };

const RegistryContext = createContext<Registry | null>(null);

export function RoadNetwork({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const [network, setNetwork] = useState<Network | null>(null);
  const hosts = useRef(new Set<Host>());

  const registry = useMemo<Registry>(
    () => ({
      add: (host) => {
        hosts.current.add(host);
        return () => hosts.current.delete(host);
      },
    }),
    [],
  );

  const factor = reduced ? 1 : ROADS.parallax;

  // --- Build, and rebuild on resize from the same seed --------------------
  useEffect(() => {
    let key = "";
    let band = window.innerHeight;
    let timer: number | undefined;

    const measure = () => {
      const width = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      // Phone browsers resize the viewport as their toolbars come and go;
      // only a real change of screen should redraw the map.
      if (Math.abs(vh - band) / band > 0.15) band = vh;

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - vh,
      );
      // Everything any layer can reach, plus a screen of margin.
      const bands = Math.ceil((factor * maxScroll + vh * 2) / band);
      const next = `${width}:${band}:${bands}`;
      if (next === key) return;
      key = next;

      const density = window.matchMedia(MOBILE_QUERY).matches
        ? ROADS.mobileDensity
        : 1;
      setNetwork(buildNetwork(width, band, bands, density));
    };

    const soon = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };

    // The pin spacer, webfonts and images all change the page height after
    // mount; ScrollTrigger's refresh is the moment it has settled.
    const resize = new ResizeObserver(soon);
    resize.observe(document.documentElement);
    window.addEventListener("resize", soon);
    ScrollTrigger.addEventListener("refresh", soon);
    soon();

    return () => {
      window.clearTimeout(timer);
      resize.disconnect();
      window.removeEventListener("resize", soon);
      ScrollTrigger.removeEventListener("refresh", soon);
    };
  }, [factor]);

  // --- Every frame: parallax, theme, masks --------------------------------
  // On GSAP's ticker, after its own update, so every animated element is
  // already in this frame's position when the masks are measured.
  useEffect(() => {
    const tick = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Where the pin releases: the pinned section's height past its stage.
      let turn = 0;
      if (!reduced) {
        for (const host of hosts.current) {
          if (host.motion !== "drive") continue;
          const section = host.scope.closest("section");
          if (section) turn = section.offsetHeight - host.scope.offsetHeight;
        }
      }
      const offset = reduced
        ? window.scrollY
        : factor * Math.abs(window.scrollY - turn);
      // Any constant would do for attached layers; this one keeps them
      // inside the generated network.
      const still = factor * turn;

      // All reads first, then all writes, so the frame lays out once.
      const plans: [Host, Plan][] = [];
      for (const host of hosts.current) {
        const plan = measureHost(
          host,
          host.motion === "attached" ? null : offset,
          still,
          vw,
          vh,
        );
        if (plan) plans.push([host, plan]);
      }

      // Neighbouring sections share their clearings, so text near an edge
      // fades the roads on BOTH sides of it instead of leaving the section
      // above with a hard cut where the section below begins to clear.
      const shared = plans.flatMap(([host, plan]) =>
        shares(host) ? plan.holes : [],
      );
      for (const [host, plan] of plans) {
        const holes = shares(host) ? shared : plan.holes;
        writeHost(host, { ...plan, holes: toLocal(holes, plan.box) });
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [factor, reduced]);

  return (
    <RegistryContext.Provider value={registry}>
      {/* The geometry, defined once and drawn by every `RoadLayer` via
          `<use>`. Zero-sized rather than `display: none`, which would stop
          the references resolving in some browsers. */}
      <svg aria-hidden="true" focusable="false" className="absolute size-0 overflow-hidden">
        <defs>
          <g id={GEOMETRY_ID}>
            {network?.roads.map((road, index) => (
              <path
                key={index}
                d={road.d}
                className={road.major ? "road-major" : "road-minor"}
              />
            ))}
            {network?.depots.map((depot, index) => (
              <circle
                key={index}
                cx={depot.x.toFixed(1)}
                cy={depot.y.toFixed(1)}
                r={depot.r.toFixed(1)}
                className="road-depot"
              />
            ))}
          </g>
        </defs>
      </svg>
      {children}
    </RegistryContext.Provider>
  );
}

/** Custom properties the road classes in `globals.css` read their alpha from. */
function inkVars(theme: "day" | "night"): CSSProperties {
  const alpha = ROADS.opacity[theme];
  return {
    "--road-minor-alpha": alpha.road,
    "--road-major-alpha": alpha.highway,
    "--road-depot-alpha": alpha.depot,
  } as CSSProperties;
}

/**
 * One window onto the network, filling its parent. Put it in a positioned
 * parent, after the parent's background and before its content.
 *
 * Where the section's content is in normal flow (not absolutely placed), give
 * the parent `relative isolate` and this `-z-10`: a negative z-index inside an
 * isolated parent paints above the parent's background but below its flow
 * content.
 */
export function RoadLayer({
  theme,
  motion = "page",
  isolated = false,
  className,
}: {
  theme: Theme;
  motion?: Motion;
  /** For layers on something that slides over the page, like the doors. */
  isolated?: boolean;
  className?: string;
}) {
  const registry = useContext(RegistryContext);
  const svgRef = useRef<SVGSVGElement>(null);
  const moveRef = useRef<SVGGElement>(null);
  const holesRef = useRef<SVGGElement>(null);
  const dayRef = useRef<SVGUseElement>(null);
  const nightRef = useRef<SVGUseElement>(null);
  const maskId = `road-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const svg = svgRef.current;
    const scope = svg?.parentElement;
    if (!registry || !svg || !scope || !moveRef.current || !holesRef.current) {
      return;
    }

    // Marks the section, so a nested layer's content (the services band,
    // inside the truck stage) is cleared by that layer and not this one too.
    scope.setAttribute("data-road-scope", "");

    const host: Host = {
      svg,
      scope,
      theme,
      motion,
      isolated,
      move: moveRef.current,
      holes: holesRef.current,
      day: dayRef.current,
      night: nightRef.current,
      nightLayer:
        theme === "stage" ? scope.querySelector<HTMLElement>("[data-night]") : null,
      dirty: true,
      texts: [],
      blocks: [],
      written: { ty: Number.NaN, night: Number.NaN, holes: "" },
    };

    // Text nodes come and go (the count-ups replace theirs every frame), so
    // the candidate list is rebuilt whenever the section's content changes.
    const observer = new MutationObserver(() => {
      host.dirty = true;
    });
    observer.observe(scope, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const remove = registry.add(host);
    return () => {
      remove();
      observer.disconnect();
      scope.removeAttribute("data-road-scope");
    };
  }, [registry, theme, motion, isolated]);

  if (!registry) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      focusable="false"
      data-road-layer
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-hidden",
        className,
      )}
    >
      <defs>
        <mask
          id={maskId}
          // Luminance in linear light. In sRGB, DOT Black (the only black the
          // palette has) still reads as ~4% light, and the roads leak through
          // their holes at that strength; linearly it is ~0.3%.
          colorInterpolation="linearRGB"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <rect width="100%" height="100%" className="road-mask-base" />
          <g ref={holesRef} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <g ref={moveRef}>
          {theme !== "night" ? (
            <use
              ref={dayRef}
              href={`#${GEOMETRY_ID}`}
              className="road-day"
              style={inkVars("day")}
            />
          ) : null}
          {theme !== "day" ? (
            <use
              ref={nightRef}
              href={`#${GEOMETRY_ID}`}
              className="road-night"
              // The stage starts in daylight; the ticker takes it from here.
              style={{ ...inkVars("night"), opacity: theme === "stage" ? 0 : 1 }}
            />
          ) : null}
        </g>
      </g>
    </svg>
  );
}

function collect(host: Host) {
  const { scope } = host;
  const belongs = (el: Element) =>
    !el.closest(IGNORE) &&
    el.closest("[data-road-scope]") === scope &&
    !el.closest("[data-road-layer]");

  host.blocks = Array.from(scope.querySelectorAll(BLOCKS)).filter(
    (el) => belongs(el) && !el.parentElement?.closest(BLOCKS),
  );

  host.texts = [];
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!node.nodeValue?.trim() || !parent) continue;
    if (!belongs(parent) || parent.closest(BLOCKS)) continue;
    host.texts.push(node as Text);
  }
  host.dirty = false;
}

const range = typeof document === "undefined" ? null : document.createRange();

/**
 * `offset` is the network's screen-space offset for this frame, or null for an
 * attached layer, which sits at the constant `still` in its own space.
 */
function measureHost(
  host: Host,
  offset: number | null,
  still: number,
  vw: number,
  vh: number,
) {
  const box = host.svg.getBoundingClientRect();
  if (
    box.width === 0 ||
    box.bottom < 0 ||
    box.top > vh ||
    box.right < 0 ||
    box.left > vw
  ) {
    return null;
  }

  if (host.dirty) collect(host);

  // Effective opacity, memoised per element for this frame. Opacity does not
  // inherit, so it is the product up the tree; `visibility` does, so the
  // element's own computed value already covers its ancestors.
  const memo = new Map<Element, number>();
  const alpha = (el: Element) => {
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return 0;
    let a = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      let own = memo.get(node);
      if (own === undefined) {
        own = Number.parseFloat(getComputedStyle(node).opacity);
        memo.set(node, own);
      }
      a *= own;
      if (a < 0.02 || node === host.scope) break;
    }
    return a < 0.02 ? 0 : a;
  };

  // In screen space here; `toLocal` moves them into a layer's own space.
  const holes: Hole[] = [];
  const add = (rect: DOMRect, a: number) => {
    if (!a || rect.width === 0 || rect.height === 0) return;
    holes.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height, a });
  };

  for (const el of host.blocks) add(el.getBoundingClientRect(), alpha(el));
  for (const text of host.texts) {
    if (!text.isConnected || !text.parentElement || !range) continue;
    range.selectNodeContents(text);
    add(range.getBoundingClientRect(), alpha(text.parentElement));
  }

  const night =
    host.theme === "stage" && host.nightLayer
      ? Number.parseFloat(getComputedStyle(host.nightLayer).opacity)
      : Number.NaN;

  return {
    ty: offset === null ? -still : -offset - box.top,
    night,
    holes,
    box,
  };
}

/**
 * Attached layers (the services band) sit over another section, and isolated
 * ones (the doors) slide across it, so neither lends or borrows clearings.
 */
const shares = (host: Host) => !host.isolated && host.motion !== "attached";

/** Screen-space holes into `box`'s space, dropping any that cannot reach it. */
function toLocal(holes: Hole[], box: DOMRect): Hole[] {
  const { padding, feather } = ROADS.mask;
  const reach = padding + feather / 2;
  return holes.flatMap((hole) => {
    const x = hole.x - box.left;
    const y = hole.y - box.top;
    if (
      x + hole.w < -reach ||
      y + hole.h < -reach ||
      x > box.width + reach ||
      y > box.height + reach
    ) {
      return [];
    }
    return [{ ...hole, x, y }];
  });
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Fill opacity of each feather ring, innermost first. The rings stack, so a
 * point `j` rings out from the core sits under rings j…steps; these are solved
 * so the mask there comes out at an even `j / (steps + 1)` in linear light
 * (the mask's space), which reads as a smooth fade instead of a hard edge.
 */
const RING_ALPHAS = (() => {
  const { steps } = ROADS.mask;
  const toSrgb = (l: number) =>
    l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
  const level = (j: number) => toSrgb(j / (steps + 1));
  return Array.from({ length: steps }, (_, i) => {
    const j = i + 1;
    return j === steps ? 1 - level(j) : 1 - level(j) / level(j + 1);
  });
})();

type Plan = NonNullable<ReturnType<typeof measureHost>>;

function writeHost(
  host: Host,
  { ty, night, holes }: Pick<Plan, "ty" | "night" | "holes">,
) {
  const { written } = host;

  const roundedTy = Math.round(ty * 10) / 10;
  if (roundedTy !== written.ty) {
    host.move.setAttribute("transform", `translate(0 ${roundedTy})`);
    written.ty = roundedTy;
  }

  if (!Number.isNaN(night)) {
    const n = Math.round(night * 100) / 100;
    if (n !== written.night) {
      if (host.day) {
        host.day.style.opacity = String(1 - n);
        host.day.style.display = n >= 1 ? "none" : "";
      }
      if (host.night) {
        host.night.style.opacity = String(n);
        host.night.style.display = n <= 0 ? "none" : "";
      }
      written.night = n;
    }
  }

  const key = holes
    .map((h) => `${Math.round(h.x)},${Math.round(h.y)},${Math.round(h.w)},${Math.round(h.h)},${h.a.toFixed(2)}`)
    .join(";");
  if (key === written.holes) return;
  written.holes = key;

  // One group per hole: a solid core plus rings that step the mask back up
  // to full strength. The group's opacity is the content's own, so roads fade
  // back in as the text over them fades out.
  const { padding, feather, steps } = ROADS.mask;
  const core = padding - feather / 2;
  const pool = host.holes;
  holes.forEach((hole, index) => {
    let group = pool.children[index] as SVGGElement | undefined;
    if (!group) {
      group = document.createElementNS(SVG_NS, "g");
      for (let s = 0; s <= steps; s += 1) {
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("class", "road-mask-hole");
        rect.setAttribute(
          "fill-opacity",
          s === 0 ? "1" : RING_ALPHAS[s - 1].toFixed(3),
        );
        group.appendChild(rect);
      }
      pool.appendChild(group);
    }
    group.style.display = "";
    group.setAttribute("opacity", hole.a.toFixed(2));
    for (let s = 0; s <= steps; s += 1) {
      const grow = core + (feather * s) / steps;
      const rect = group.children[s];
      rect.setAttribute("x", String(Math.round(hole.x - grow)));
      rect.setAttribute("y", String(Math.round(hole.y - grow)));
      rect.setAttribute("width", String(Math.round(hole.w + grow * 2)));
      rect.setAttribute("height", String(Math.round(hole.h + grow * 2)));
      rect.setAttribute("rx", String(Math.round(grow)));
    }
  });
  for (let i = holes.length; i < pool.children.length; i += 1) {
    (pool.children[i] as SVGGElement).style.display = "none";
  }
}
