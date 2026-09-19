"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Facility = {
  number: string;
  label: string;
  stat: string;
  unit: string;
  description: string;
  icon: "parking" | "maintenance" | "fuel" | "warehouse" | "pin";
};

const FACILITIES: Facility[] = [
  {
    number: "01",
    label: "Parking yard",
    stat: "90,000",
    unit: "SQ FT",
    description: "Dedicated parking infrastructure supporting our growing fleet.",
    icon: "parking",
  },
  {
    number: "02",
    label: "Maintenance yard",
    stat: "20",
    unit: "BAYS",
    description: "Dedicated facility for vehicle maintenance, repairs and fleet upkeep.",
    icon: "maintenance",
  },
  {
    number: "03",
    label: "Petrol pumps",
    stat: "2",
    unit: "PETROL PUMPS",
    description: "Self owned petrol pumps supporting reliable and controlled fuelling operations.",
    icon: "fuel",
  },
  {
    number: "04",
    label: "Warehouse ",
    stat: "265,000",
    unit: "SQ FT",
    description: "Strategically developing warehousing capacity to strengthen DOT's broader logistics ecosystem.",
    icon: "warehouse",
  },
  {
    number: "05",
    label: "Facilities",
    stat: "8",
    unit: "FACILITIES",
    description: "Physical infrastructure supporting fleet management, planning, maintenance and day-to-day operations.",
    icon: "pin",
  },
];

/**
 * A simple, single-purpose band: five facility numbers, each with an index,
 * an icon, the stat, and a short description, divided into columns on `sm`
 * and up. The only motion is a small fade-and-rise per column, staggered
 * left to right, played once via IntersectionObserver the first time the
 * strip scrolls into view -- same treatment as StatsStrip. Respects
 * prefers-reduced-motion.
 */
export function FacilitiesStats() {
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
    <section className="border-b border-border bg-background text-on-background ">
      <Container className="py-16 lg:py-20">
        <div
          ref={ref}
          className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0"
        >
          {FACILITIES.map((facility, index) => (
            <div
              key={facility.label}
              style={{ transitionDelay: shown ? `${index * 90}ms` : "0ms" }}
              className={cn(
                "transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
                shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                "lg:border-l lg:border-border lg:px-8 lg:first:border-l-0 lg:first:pl-0",
              )}
            >
      
              <span aria-hidden="true" className="mt-1 block h-0.5 w-6 rounded-full bg-accent" />

              <span
                aria-hidden="true"
                className="mt-4 grid h-12 w-12 place-items-center rounded-lg border border-border text-on-surface"
              >
                <FacilityIcon name={facility.icon} className="h-6 w-6" />
              </span>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-muted">
                {facility.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {facility.stat}{" "}
                <span className="text-sm font-semibold text-on-muted">{facility.unit}</span>
              </p>

              <span aria-hidden="true" className="mt-3 block h-px w-8 bg-border" />
            
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
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function FacilityIcon({ name, className }: { name: Facility["icon"]; className?: string }) {
  switch (name) {
    case "parking":
      return (
        <svg {...iconProps(className)}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9.5 16V8h2.7a2.4 2.4 0 0 1 0 4.8H9.5" />
        </svg>
      );
    case "maintenance":
      return (
        <svg {...iconProps(className)}>
          <path d="M14.5 6.5 18 3l1 1-3.5 3.5" />
          <path d="M13 8 4.5 16.5a1.5 1.5 0 0 0 2 2L15 10" />
          <path d="M6 20 3 17" />
          <circle cx="17.5" cy="8.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "fuel":
      return (
        <svg {...iconProps(className)}>
          <path d="M5 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14" />
          <path d="M4 20h10" />
          <path d="M13 10h2l3 3v4.5a1.5 1.5 0 0 1-3 0V16" />
          <path d="M7 8h3" />
          <path d="M17.5 5 15 7.5" />
        </svg>
      );
    case "warehouse":
      return (
        <svg {...iconProps(className)}>
          <path d="M3 21V10l9-6 9 6v11" />
          <path d="M7 21v-7h10v7" />
          <path d="M9 16.5h6" />
        </svg>
      );
    case "pin":
      return (
        <svg {...iconProps(className)}>
          <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
  }
}
