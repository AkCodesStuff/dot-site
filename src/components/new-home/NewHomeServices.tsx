"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "react";
import { useRef } from "react";

import { Container } from "@/components/ui/Container";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Placeholder line-up — swap the copy once the real service set is settled. */
const SERVICES = [
  {
    icon: "truck" as const,
    name: "Full truckload",
    body: "Dedicated capacity for high-volume freight, one consignment per trailer, start to finish.",
  },
  {
    icon: "route" as const,
    name: "Long-haul lanes",
    body: "Scheduled trunk routes between metros, run to a timetable rather than to whoever is free.",
  },
  {
    icon: "clock" as const,
    name: "Time-definite",
    body: "Committed delivery windows for freight that costs money every hour it sits still.",
  },
  {
    icon: "pin" as const,
    name: "Live tracking",
    body: "Position and ETA on every load, visible to your team without a phone call.",
  },
];

/**
 * The cover that comes up over the truck stage. The diagonal top edge is a
 * static `clip-path`, and the overlap is a negative margin — the "sliding up
 * over" is the pin itself: the stage is still held in place for the sequence's
 * outro while this section scrolls up across it.
 */
export function NewHomeServices() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from("[data-service-card]", {
        y: 28,
        autoAlpha: 0,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-service-grid]",
          start: "top 92%",
          end: "top 55%",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-10 -mt-[5vw] bg-background pb-20 pt-[calc(4vw+5rem)] text-on-background lg:pb-28"
      style={
        {
          clipPath: "polygon(0 4vw, 100% 0, 100% 100%, 0 100%)",
        } as CSSProperties
      }
    >
      <Container>
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          What we run
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Four ways freight moves with us.
        </h2>

        <div
          data-service-grid
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SERVICES.map((service) => (
            <article
              key={service.name}
              data-service-card
              className="rounded-2xl border border-border bg-surface-raised p-6 text-on-surface-raised"
            >
              <ServiceIcon name={service.icon} className="h-8 w-8 text-accent" />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">
                {service.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-muted">
                {service.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceIcon({
  name,
  className,
}: {
  name: (typeof SERVICES)[number]["icon"];
  className?: string;
}) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "truck":
      return (
        <svg {...props}>
          <path d="M2.5 6.5h10v9h-10z" />
          <path d="M12.5 10h4l4.5 2.5v3h-8.5z" />
          <circle cx="6.5" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
      );
    case "route":
      return (
        <svg {...props}>
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="5.5" r="2.5" />
          <path d="M8 18.5h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5.2l3.4 2" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
  }
}
