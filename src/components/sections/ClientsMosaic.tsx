"use client";

import { useEffect, useRef, useState } from "react";

import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * Placeholder client roster -- fictional names, not real companies. The
 * reference layout for this page was a real logistics company's actual
 * client logos; reusing their real brands here would misrepresent who DOT
 * actually works with. Swap this array for real client logos (as images,
 * via the same Image pattern used elsewhere) once there's a real roster to
 * show, same convention as the fleet numbers in StatsStrip.
 */
const CLIENTS = [
  "Northline",
  "Vantra Electronics",
  "Kestrel Motors",
  "Pinehill Foods",
  "Solace Home",
  "Ridgeway Apparel",
  "Brightcart",
  "Ferrotech",
  "Cobalt Devices",
  "Larkspur Goods",
  "Ashgrove Mfg.",
  "Quill & Co.",
  "Palermo Kitchens",
  "Ironvale Auto",
  "Driftwood Retail",
  "Nimbus Electronics",
  "Halcyon Consumer",
  "Foundry Works",
  "Cedarline",
  "Summit Outfitters",
];

/**
 * A plain mosaic grid of client wordmarks. The only motion is a small
 * fade-and-rise per tile, staggered in reading order, played once via
 * IntersectionObserver the first time the grid scrolls into view --
 * same treatment as StatsStrip. Respects prefers-reduced-motion.
 */
export function ClientsMosaic() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Section tone="surface" className="border-b border-border">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          Clients
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Brands who move with us
        </h2>
        <span aria-hidden="true" className="mt-4 block h-1 w-14 rounded-full bg-accent" />
      </div>

      <div
        ref={ref}
        className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12 lg:grid-cols-5"
      >
        {CLIENTS.map((name, index) => (
          <div
            key={name}
            style={{ transitionDelay: shown ? `${Math.min(index, 12) * 40}ms` : "0ms" }}
            className={cn(
              "flex aspect-3/2 items-center justify-center rounded-xl border border-border bg-surface-raised p-4 text-center transition-all duration-500 ease-out motion-reduce:transition-none",
              "hover:border-secondary",
              shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            <span className="text-sm font-semibold tracking-tight text-on-surface-raised sm:text-base">
              {name}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
