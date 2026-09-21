"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { LogoMark } from "@/components/layout/Logo";
import { SEQUENCE } from "@/components/new-home/config";
import { ChevronDown, LineTruck } from "@/components/new-home/RoadArt";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LINE = "We're upgrading. Something new is on the way.";

/**
 * The ambient traffic along the panel's floor: how wide each truck is, how far
 * up from the bottom edge it sits, and how its crossing time scales against
 * `SEQUENCE.intro.truckCrossing`. Three sizes at three heights read as depth.
 */
const TRAFFIC = [
  { width: 104, bottom: 14, speed: 1 },
  { width: 70, bottom: 74, speed: 1.5 },
  { width: 88, bottom: 44, speed: 0.78 },
];

/**
 * ============================================================================
 * INTRO DOORS
 * ============================================================================
 * A full-screen dark panel that splits down the vertical centre and slides
 * apart like automatic mall doors, revealing the truck stage already pinned
 * behind it.
 *
 * HOW THE SPLIT WORKS
 * Each half is 50vw wide with `overflow-hidden`, and each contains its own
 * full-viewport-width copy of the panel content, anchored to the seam. The two
 * copies line up pixel for pixel across the centre line, so the panel reads as
 * one surface — until the halves translate apart and each takes its half of
 * the logo with it. Nothing is animated but `xPercent`.
 *
 * The overlay is `fixed`, so the page does not move at all while the doors
 * open: scroll drives the split, and the truck stage behind it is pinned from
 * scroll position 0. Both are scrubbed against the same scroll positions, so
 * they cannot drift apart.
 *
 * The mark is the inline `LogoMark`, not the Cloudinary logo PNG — that file
 * is a black `D` on transparency, which would be invisible on this panel.
 * `LogoMark` recolours from `currentColor` and keeps its DOT Yellow dot.
 */
export function IntroDoors() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      gsap
        .timeline({
          scrollTrigger: {
            // Numeric start/end are absolute scroll positions, so the doors
            // need no trigger element of their own — handy, because a `fixed`
            // overlay never moves and would make a useless trigger.
            start: 0,
            end: () => SEQUENCE.phases.doors * window.innerHeight,
            scrub: SEQUENCE.scrub,
            invalidateOnRefresh: true,
          },
          defaults: { ease: SEQUENCE.doors.ease },
        })
        .to(leftRef.current, { xPercent: -100 }, 0)
        .to(rightRef.current, { xPercent: 100 }, 0);

      // Ambient loops below. Each tween drives BOTH copies of the same element
      // at once, which is what keeps a truck crossing the seam unbroken.
      TRAFFIC.forEach((truck, index) => {
        const tween = gsap.fromTo(
          `[data-intro-truck="${index}"]`,
          { x: "-20vw" },
          {
            x: "110vw",
            duration: SEQUENCE.intro.truckCrossing / truck.speed,
            ease: "none",
            repeat: -1,
          },
        );
        // Space them out along the loop instead of releasing all three together.
        tween.progress(index / TRAFFIC.length);
      });

      gsap.to("[data-intro-chevron]", {
        y: 7,
        duration: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  // Reduced motion: no doors, no choreography — the same panel as a plain
  // section at the top of the page, which the visitor simply scrolls past.
  if (reduced) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-primary px-6 py-24 text-on-background">
        <LogoMark className="h-20 w-20 sm:h-24 sm:w-24" />
        <p className="max-w-md text-center text-base leading-relaxed text-on-background/70">
          {LINE}
        </p>
      </section>
    );
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r border-accent/25 bg-background text-on-background"
      >
        {/* A full-viewport-width copy of the panel, anchored to the seam. */}
        <div className="absolute inset-y-0 left-0 w-[200%]">
          <DoorFace />
        </div>
      </div>

      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l border-accent/25 bg-background text-on-background"
      >
        {/* The mirror copy. Hidden from screen readers so the panel's one line
            of copy is not announced twice. */}
        <div className="absolute inset-y-0 right-0 w-[200%]" aria-hidden="true">
          <DoorFace />
        </div>
      </div>
    </div>
  );
}

/** One full-viewport copy of the panel's contents. Rendered once per half. */
function DoorFace() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6">
        <LogoMark className="h-20 w-20 sm:h-24 sm:w-24" />
        <p className="max-w-md text-center text-base leading-relaxed text-on-background/70 sm:text-lg">
          {LINE}
        </p>
      </div>

      <div
        data-intro-chevron
        className="absolute inset-x-0 bottom-32 flex justify-center text-on-background/45"
      >
        <ChevronDown className="h-6 w-6" />
      </div>

      {TRAFFIC.map((truck, index) => (
        <div
          key={index}
          data-intro-truck={index}
          aria-hidden="true"
          className="absolute left-0 text-on-background /25"
          style={{ bottom: truck.bottom, width: truck.width }}
        >
          <LineTruck className="w-full" />
        </div>
      ))}
    </div>
  );
}
