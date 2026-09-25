"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";

import { Wordmark } from "@/components/layout/Logo";
import { SEQUENCE } from "@/components/new-home/config";
import { ChevronDown, LineTruck } from "@/components/new-home/RoadArt";
import { RoadLayer } from "@/components/new-home/RoadNetwork";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * One word per line, each centred on the viewport — so the seam runs through
 * the middle of BOTH words and each one leaves half on either door, rather
 * than the two words sitting either side of the split with a hole between
 * them. Sized in `vw` rather than at breakpoints because a line now has the
 * whole viewport to print in: a fixed ramp either overflows the narrow end or
 * leaves the wide end looking timid.
 *
 * The lead is kept in two pieces so its apostrophe can be placed on the seam
 * itself — see `Headline`.
 */
const HEADLINE = {
  lead: ["We", "re"],
  apostrophe: "’",
  accent: "Upgrading",
};
const HEADLINE_TYPE =
  "font-headline text-[13vw] font-bold uppercase leading-none tracking-tight sm:text-[9vw]";

/** The mark on its own. Black on transparency, so it needs a light panel. */
const LOGO_SRC =
  "https://res.cloudinary.com/js6wkdfq/image/upload/v1789822433/dot-logo-bg-2.png";

/**
 * The ambient traffic along the panel's floor: how wide each truck is, how far
 * up from the bottom edge it sits, and how its crossing time scales against
 * `SEQUENCE.intro.truckCrossing`.
 *
 * Bigger and faster along the bottom, smaller and slower further up, so the
 * three lanes read as near-to-far rather than as three identical rows.
 *
 * Each lane carries `intro.trucksPerLane` trucks, and the ones sharing a lane
 * share its speed and sit evenly spaced around the loop. That is what keeps
 * the floor populated: a truck is on screen for about four fifths of its
 * crossing, so two per lane means at least one is always visible, and three
 * lanes never show fewer than three trucks at once. Sharing a speed is also
 * what stops a lane's trucks from ever catching each other up — they hold the
 * same gap forever instead of drifting into an overlap.
 */
const LANES = [
  { width: 104, bottom: 10, speed: 1.35 },
  { width: 78, bottom: 56, speed: 1 },
  { width: 62, bottom: 94, speed: 0.72 },
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
 * one surface — until the halves translate apart, the mark leaving with the
 * left door and the wordmark with the right. Nothing is animated but
 * `xPercent`.
 *
 * The overlay is `fixed`, so the page does not move at all while the doors
 * open: scroll drives the split, and the truck stage behind it is pinned from
 * scroll position 0. Both are scrubbed against the same scroll positions, so
 * they cannot drift apart.
 *
 * The panel is light, which is what lets it use the real logo file — that PNG
 * is a black `D` on transparency and would disappear on a dark surface.
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
      const perLane = SEQUENCE.intro.trucksPerLane;
      LANES.forEach((lane, laneIndex) => {
        for (let copy = 0; copy < perLane; copy += 1) {
          const tween = gsap.fromTo(
            `[data-intro-truck="${laneIndex}-${copy}"]`,
            { x: "-20vw" },
            {
              x: "110vw",
              // Shared across the lane, so its trucks hold their spacing.
              duration: SEQUENCE.intro.truckCrossing / lane.speed,
              ease: "none",
              repeat: -1,
            },
          );
          // Evenly spaced around the loop rather than released together.
          tween.progress(copy / perLane);
        }
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
      <section className="relative isolate flex min-h-[70vh] flex-col items-center justify-center gap-7 bg-background px-6 py-24 text-on-background">
        <RoadLayer theme="day" className="-z-10" />
        <div className="flex items-center gap-5">
          <Image
            src={LOGO_SRC}
            alt=""
            width={204}
            height={203}
            priority
            className="h-16 w-16 sm:h-40 sm:w-40"
          />
          <Wordmark className="text-[6vw]" />
        </div>
        <Headline />
      </section>
    );
  }

  return (
    <div
      ref={rootRef}
      // Above the navbar (z-50) so the closed panel hides it, but below the
      // skip link (z-60) so keyboard users can still reach it from here.
      // The root stays click-through; the halves below take the clicks, and
      // once they slide off screen they stop intercepting anything.
      className="pointer-events-none fixed inset-0 z-55 overflow-hidden"
    >
      <div
        ref={leftRef}
        className="pointer-events-auto absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-background text-on-background"
      >
        {/* A full-viewport-width copy of the panel, anchored to the seam. */}
        <div className="absolute inset-y-0 left-0 w-[200%]">
          <DoorFace />
        </div>
      </div>

      <div
        ref={rightRef}
        className="pointer-events-auto absolute inset-y-0 right-0 w-1/2 overflow-hidden  bg-background text-on-background"
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

/**
 * The panel's line of copy: one word per line, both centred on the viewport.
 * Centring is the whole point — it is what puts the middle of each word on the
 * seam, so the doors take half of "WE’RE" and half of "UPGRADING." each.
 */
function Headline() {
  return (
    <p className={cn("w-full", HEADLINE_TYPE)}>
      {/* The visible line is built out of boxes rather than one run of text,
          so it is read once, here, as the phrase it is. */}
      <span className="sr-only" data-road-ignore>
        {HEADLINE.lead.join(HEADLINE.apostrophe)} {HEADLINE.accent}.
      </span>

      <span aria-hidden="true">
        {/* Centring the whole word would put the seam wherever its middle
            happens to fall — on the E, because the W is so much wider than
            the R. Giving the apostrophe a column of its own between two equal
            ones centres THE APOSTROPHE instead, so that is what the doors
            split through. */}
        <span className="grid w-full grid-cols-[1fr_auto_1fr] items-baseline">
          <span className="text-right">{HEADLINE.lead[0]}</span>
          <span>{HEADLINE.apostrophe}</span>
          <span className="text-left">{HEADLINE.lead[1]}</span>
        </span>

        <span className="block text-center text-accent">
          {HEADLINE.accent}
          <span className="text-on-background">.</span>
        </span>
      </span>
    </p>
  );
}

/** One full-viewport copy of the panel's contents. Rendered once per half. */
function DoorFace() {
  return (
    <div className="relative h-full w-full">
      {/* Painted on the door, so it leaves with it. Both doors place it by
          the same rule as the stage behind, so the closed panel lines up
          with the network that the opening reveals. */}
      <RoadLayer theme="day" isolated />

      {/* `md:pb-32` centres the lockup in the space above the chevron and the
          traffic lanes rather than in the full panel, which left it sitting
          visibly low on a desktop screen. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6 md:pb-32">
        {/* The lockup straddles the seam: the mark takes the left half's inner
            edge, the wordmark the right half's. Both doors render this same
            row and clip it to their own side, so the split falls exactly
            between the two — never through a glyph. The row is symmetric, so
            its midpoint stays on the centre line whatever the padding. */}
        <div className="flex w-full items-center">
          <div className="flex w-1/2 justify-end pr-5 sm:pr-7">
            <Image
              src={LOGO_SRC}
              alt=""
              width={204}
              height={203}
              priority
              className="h-16 w-16 sm:h-24 sm:w-24"
            />
          </div>
          <div className="flex w-1/2 justify-start pl-5 sm:pl-7">
            <Wordmark className="text-6xl sm:text-8xl" />
          </div>
        </div>

        {/* Same seam, same trick: both words live in the DOM of both doors, so
            the left copy still reads as one phrase to a screen reader even
            though each door only shows half of every letter-run. */}
        <Headline />
      </div>

      <div
        data-intro-chevron
        className="absolute inset-x-0 bottom-32 flex justify-center text-on-background/45"
      >
        <ChevronDown className="h-6 w-6" />
      </div>

      {LANES.map((lane, laneIndex) =>
        Array.from({ length: SEQUENCE.intro.trucksPerLane }, (_, copy) => (
          <div
            key={`${laneIndex}-${copy}`}
            data-intro-truck={`${laneIndex}-${copy}`}
            aria-hidden="true"
            className="absolute left-0 text-on-background/25"
            style={{ bottom: lane.bottom, width: lane.width }}
          >
            <LineTruck className="w-full" />
          </div>
        )),
      )}
    </div>
  );
}
