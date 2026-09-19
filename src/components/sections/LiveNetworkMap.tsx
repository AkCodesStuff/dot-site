"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap, Polyline } from "leaflet";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * LIVE NETWORK MAP
 * ============================================================================
 * A dark, non-interactive Leaflet map of the network's hub cities, with the
 * connecting lines between them drawn progressively rather than appearing
 * all at once.
 *
 * ANIMATION
 * - `lg` and up: the section pins (`sticky`) for extra scroll, and scroll
 *   position through that range is read every frame and mapped directly onto
 *   how much of each connecting line is drawn — the same "grounded", no-
 *   easing technique used by `ScrollVideo` and `SolutionsShowcase`. The
 *   heading is visible immediately; the supporting paragraph and CTA fade in
 *   only once the last line finishes, and fade back out if you scroll back
 *   up past that point — fully reversible, nothing is a one-way trigger.
 * - Below `lg`: there's no scroll-pin (a long forced scroll-jack is worse UX
 *   on a phone than it's worth for this). Instead the same draw animation
 *   plays once, over a fixed duration, the first time the map scrolls into
 *   view, using `IntersectionObserver`.
 * - `prefers-reduced-motion`: the lines render fully drawn immediately and
 *   the text is shown immediately, no animation, no gating.
 *
 * The line-draw itself is the standard SVG technique (`stroke-dasharray` set
 * to the path's total length, `stroke-dashoffset` animated from that length
 * down to 0) applied through Leaflet's own `dashArray`/`dashOffset` path
 * options rather than touching the DOM directly.
 */

type City = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Unlabelled cities render as a smaller, quieter node. */
  labeled: boolean;
};

const CITIES: City[] = [
  { id: "delhi", name: "Delhi", lat: 28.6139, lng: 77.209, labeled: true },
  { id: "mumbai", name: "Mumbai", lat: 19.076, lng: 72.8777, labeled: true },
  { id: "kolkata", name: "Kolkata", lat: 22.5726, lng: 88.3639, labeled: true },
  { id: "chennai", name: "Chennai", lat: 13.0827, lng: 80.2707, labeled: true },
  { id: "bengaluru", name: "Bengaluru", lat: 12.9716, lng: 77.5946, labeled: true },
  { id: "hyderabad", name: "Hyderabad", lat: 17.385, lng: 78.4867, labeled: false },
  { id: "pune", name: "Pune", lat: 18.5204, lng: 73.8567, labeled: false },
  { id: "ahmedabad", name: "Ahmedabad", lat: 23.0225, lng: 72.5714, labeled: false },
];

/** Edges of the network graph, as pairs of city ids. */
const CONNECTIONS: Array<[string, string]> = [
  ["delhi", "mumbai"],
  ["delhi", "kolkata"],
  ["delhi", "bengaluru"],
  ["mumbai", "bengaluru"],
  ["mumbai", "chennai"],
  ["bengaluru", "chennai"],
  ["chennai", "kolkata"],
  ["mumbai", "ahmedabad"],
  ["mumbai", "pune"],
  ["bengaluru", "hyderabad"],
];

/** Tablet/desktop breakpoint — matches Tailwind's `lg`. Above it: pinned
 *  scroll-scrubbed draw. Below it: a one-shot draw on first scroll-into-view. */
const DESKTOP_QUERY = "(min-width: 1024px)";
/** How long the one-shot mobile draw takes, in ms. */
const MOBILE_DRAW_MS = 2200;
/** Extra scroll (vh) the desktop pin runs for. */
const PIN_LENGTH_VH = 140;
/** Fraction of each line's draw window that overlaps the next line's. */
const OVERLAP = 0.55;

export function LiveNetworkSection({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  cta: { label: string; href: string };
}) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const linesRef = useRef<Array<{ line: Polyline; length: number }>>([]);
  const [revealed, setRevealed] = useState(false);
  const [runwayHeight, setRunwayHeight] = useState<string>(`${PIN_LENGTH_VH}svh`);

  // --- Set up the Leaflet map once. ----------------------------------------
  useEffect(() => {
    const container = mapElRef.current;
    if (!container) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    // Dynamic import: Leaflet touches `window` at module scope (browser
    // sniffing), which breaks server rendering if imported statically.
    import("leaflet").then((leafletModule) => {
      if (cancelled) return;
      const L = leafletModule.default;

      const map = L.map(container, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: true,
        fadeAnimation: false,
      });
      mapRef.current = map;

      // Esri's classic Canvas basemap: no API key, no watermark. Just the
      // dark fill layer -- Esri also publishes a "Reference" layer with real
      // place-name labels, but it's dense enough at country scale to clutter
      // the clean, schematic look this section is going for; our own five
      // marker labels below are the only labels on the map. Note the tile
      // URL is z/y/x, not the more common z/x/y.
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 12,
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        },
      ).addTo(map);

      const cityMarkers = new Map<string, [number, number]>();
      for (const city of CITIES) {
        cityMarkers.set(city.id, [city.lat, city.lng]);

        const icon = L.divIcon({
          className: "",
          html: city.labeled
            ? `<div class="relative flex flex-col items-center">
                 <span class="network-node__pulse absolute h-2.5 w-2.5 rounded-full bg-accent"></span>
                 <span class="relative h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_8px_2px] shadow-accent/70"></span>
                 <span class="network-label absolute top-4 whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-overlay">${city.name}</span>
               </div>`
            : `<div class="relative flex items-center justify-center">
                 <span class="network-node__pulse absolute h-1.5 w-1.5 rounded-full bg-accent/70"></span>
                 <span class="relative h-1.5 w-1.5 rounded-full bg-accent/70"></span>
               </div>`,
          iconSize: city.labeled ? [12, 12] : [8, 8],
          iconAnchor: city.labeled ? [6, 6] : [4, 4],
        });

        L.marker([city.lat, city.lng], {
          icon,
          keyboard: false,
          interactive: false,
        }).addTo(map);
      }

      const bounds = L.latLngBounds(Array.from(cityMarkers.values()));

      const lines = CONNECTIONS.map(([fromId, toId]) => {
        const from = cityMarkers.get(fromId);
        const to = cityMarkers.get(toId);
        if (!from || !to) return null;
        // Colour comes from the `.network-line` CSS rule in globals.css, not
        // a `color` option here — Leaflet applies `color` via a raw SVG
        // `stroke` attribute, and `var(--accent)` cannot resolve through
        // that (only through an actual CSS property). See the comment there.
        const line = L.polyline([from, to], {
          className: "network-line",
          weight: 1.75,
          opacity: 0.9,
          interactive: false,
        }).addTo(map);
        return { line, length: 0 };
      }).filter((entry): entry is { line: Polyline; length: number } => entry !== null);
      linesRef.current = lines;

      // Fit the view to the network, then measure each line's on-screen
      // pixel length (Leaflet draws in screen space, so this must happen
      // after the view is set) and hide every line at its own length ready
      // to be drawn in.
      const layout = () => {
        map.invalidateSize();
        // Capped so a tall/narrow container can't force a tighter zoom than
        // a wide one -- the network should read at roughly the same scale
        // regardless of the container's aspect ratio.
        map.fitBounds(bounds, { padding: [32, 40], maxZoom: 5 });
        for (const entry of lines) {
          const path = entry.line.getElement();
          const measured = path instanceof SVGPathElement ? path.getTotalLength() : 0;
          entry.length = measured;
          entry.line.setStyle({ dashArray: String(measured), dashOffset: String(measured) });
        }
      };
      layout();

      resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(container);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      linesRef.current = [];
    };
  }, []);

  // --- Draw progress: apply 0..1 to the staggered lines, and gate the text.
  const applyProgress = (progress: number) => {
    const lines = linesRef.current;
    const count = lines.length;
    if (count === 0) return;

    const windowSize = 1 / (1 + (count - 1) * (1 - OVERLAP));
    const step = windowSize * (1 - OVERLAP);

    lines.forEach((entry, index) => {
      const start = index * step;
      const local = Math.min(Math.max((progress - start) / windowSize, 0), 1);
      entry.line.setStyle({ dashOffset: String(entry.length * (1 - local)) });
    });

    setRevealed(progress >= 0.98);
  };

  // --- Desktop: scroll-pin drives progress directly. Mobile: a one-shot
  // timed draw the first time the map is scrolled into view. Reduced motion:
  // skip both, show everything immediately. -------------------------------
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      // Wait a tick so the lines exist (they're created inside the async
      // Leaflet import above) before drawing them fully.
      const id = window.setTimeout(() => applyProgress(1), 50);
      return () => window.clearTimeout(id);
    }

    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    let cleanupMode: (() => void) | undefined;

    const setupDesktopPin = () => {
      const runway = runwayRef.current;
      if (!runway) return () => {};

      let frame = 0;
      const update = () => {
        frame = 0;
        const rect = runway.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) {
          applyProgress(rect.top <= 0 ? 1 : 0);
          return;
        }
        const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
        applyProgress(progress);
      };
      const onScroll = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();

      return () => {
        if (frame) window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    };

    const setupMobileOneShot = () => {
      const target = mapElRef.current;
      if (!target) return () => {};

      let played = false;
      let frame = 0;

      const observer = new IntersectionObserver(
        (entries) => {
          if (played || !entries[0]?.isIntersecting) return;
          played = true;
          observer.disconnect();

          const startedAt = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(
              (now - startedAt) / MOBILE_DRAW_MS,
              1,
            );
            applyProgress(progress);
            if (progress < 1) frame = window.requestAnimationFrame(tick);
          };
          frame = window.requestAnimationFrame(tick);
        },
        { threshold: 0.4 },
      );
      observer.observe(target);

      return () => {
        observer.disconnect();
        if (frame) window.cancelAnimationFrame(frame);
      };
    };

    const applyMode = () => {
      cleanupMode?.();
      setRunwayHeight(desktopQuery.matches ? `${PIN_LENGTH_VH}svh` : "auto");
      // Reset to the undrawn state when switching modes so the chosen
      // driver starts from a consistent baseline.
      applyProgress(0);
      cleanupMode = desktopQuery.matches
        ? setupDesktopPin()
        : setupMobileOneShot();
    };

    // Lines are created asynchronously (dynamic `import("leaflet")`); give
    // that a moment, then start driving progress.
    const startId = window.setTimeout(applyMode, 80);
    desktopQuery.addEventListener("change", applyMode);

    return () => {
      window.clearTimeout(startId);
      desktopQuery.removeEventListener("change", applyMode);
      cleanupMode?.();
    };
  }, []);

  return (
    <section className="border-b border-border bg-overlay text-on-overlay">
      <div
        ref={runwayRef}
        style={{ height: runwayHeight }}
        className="relative"
      >
        <div
          ref={stageRef}
          className="sticky top-0 flex min-h-svh flex-col lg:h-svh lg:flex-row"
        >
          {/* Map */}
          <div className="relative h-[60svh] w-full shrink-0 lg:h-full lg:w-[60%]">
            <div
              ref={mapElRef}
              aria-hidden="true"
              tabIndex={-1}
              className="absolute inset-0"
            />
            {/* Edge fade into the text column, desktop only. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-overlay lg:block"
            />
          </div>

          {/* Text */}
          <Container className="flex flex-1 flex-col justify-center py-10 lg:py-0">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                {eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h2>
              <span
                aria-hidden="true"
                className="mt-4 block h-1 w-14 rounded-full bg-accent"
              />

              <div
                className={cn(
                  "mt-6 transition-all duration-700 ease-out motion-reduce:transition-none",
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <p className="text-lg leading-relaxed text-on-overlay/70">
                  {description}
                </p>
                <ButtonLink
                  href={cta.href}
                  variant="accent"
                  size="lg"
                  className="mt-6"
                >
                  {cta.label} &rarr;
                </ButtonLink>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
