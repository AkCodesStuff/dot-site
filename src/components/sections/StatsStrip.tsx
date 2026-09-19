"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Stat = {
  icon: "truck" | "container" | "weight" | "height" | "road";
  value: string;
  label: string;
};

/**
 * Placeholder fleet stats -- swap for real figures when they exist, same as
 * the demo data in TrackingWidget and the roles array on the careers page.
 */
const STATS: Stat[] = [
  { icon: "truck", value: "850+", label: "Active vehicles" },
  { icon: "container", value: "32 & 34 FT.", label: "Container fleet" },
  { icon: "weight", value: "7-9 MT", label: "Carrying capacity" },
  { icon: "height", value: "10.5 FT HQ", label: "High-cube for more volume" },
  { icon: "road", value: "~9,000 KM", label: "Average monthly run / vehicle" },
];

/**
 * ============================================================================
 * STATS STRIP
 * ============================================================================
 * A simple, single-purpose band: five fleet numbers with an icon each,
 * separated by dividers on a single row from `lg` up, wrapped into a plain
 * grid below that. The only motion is a small fade-and-rise per stat,
 * staggered left to right, played once the strip is scrolled into view
 * (IntersectionObserver, not a scroll-scrub like the sections above it --
 * this one is small on purpose). Respects prefers-reduced-motion.
 */
export function StatsStrip() {
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-border bg-background text-on-background">
      <Container className="py-12 lg:py-14">
        <div
          ref={ref}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-0"
        >
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              style={{ transitionDelay: shown ? `${index * 90}ms` : "0ms" }}
              className={cn(
                "transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                "lg:border-l lg:border-border lg:px-8 lg:first:border-l-0 lg:first:pl-0",
              )}
            >
              <StatIcon name={stat.icon} className="h-8 w-8 text-accent" />
              <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-on-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function StatIcon({ name, className }: { name: Stat["icon"]; className?: string }) {
  switch (name) {
    case "truck":
      return (
        <svg {...iconProps(className)}>
          <path d="M2.5 6.5h10v9h-10z" />
          <path d="M12.5 10h4l4.5 2.5v3h-8.5z" />
          <circle cx="6.5" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
      );
    case "container":
      return (
        <svg {...iconProps(className)}>
          <rect x="2.5" y="6" width="19" height="10" rx="0.5" />
          <path d="M6 6v10M9.5 6v10M13 6v10M16.5 6v10" />
          <path d="M4 16v2M20 16v2" />
        </svg>
      );
    case "weight":
      return (
        <svg {...iconProps(className)}>
          <path d="M9 7a3 3 0 0 1 6 0" />
          <path d="M5.5 7h13l1.2 12.5a1.5 1.5 0 0 1-1.5 1.6H5.8a1.5 1.5 0 0 1-1.5-1.6L5.5 7Z" />
          <text
            x="12"
            y="14.5"
            textAnchor="middle"
            fontSize="6"
            fontWeight="700"
            stroke="none"
            fill="currentColor"
          >
            KG
          </text>
        </svg>
      );
    case "height":
      return (
        <svg {...iconProps(className)}>
          <path d="M12 3v18" />
          <path d="M8.5 6.5 12 3l3.5 3.5" />
          <path d="M8.5 17.5 12 21l3.5-3.5" />
        </svg>
      );
    case "road":
      return (
        <svg {...iconProps(className)}>
          <path d="M9 21 10.5 3" />
          <path d="M15 21 13.5 3" />
          <path d="M12 4.5v3M12 10.5v3M12 16.5v2" />
        </svg>
      );
  }
}
