"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import type { CSSProperties, ReactNode, Ref } from "react";
import { useEffect, useRef } from "react";

import {
  BAND_COVER_VH,
  BAND_HEIGHT_VH,
  buildTimeline,
  DESKTOP_QUERY,
  MOBILE_QUERY,
  SEQUENCE,
  WIDE_QUERY,
  type TimelinePlan,
} from "@/components/new-home/config";
import { ProcessList } from "@/components/new-home/ProcessList";
import { Barrier, TrafficCone } from "@/components/new-home/RoadArt";
import {
  SERVICES,
  ServicesBand,
  ServicesList,
} from "@/components/new-home/ServicesBand";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Bird's-eye truck art. Drawn facing down, so it is flipped 180° to drive up. */
const TRUCK_SRC =
  "https://res.cloudinary.com/js6wkdfq/image/upload/v1790004026/Untitled_design-removebg-preview.png";

const MISSION = {
  title: "Built for the long haul.",
  body: "Dot Truckers Limited runs full-truckload freight the length of the country — asset-backed capacity, and one team accountable from pickup to delivery.",
};

/**
 * Indian digit grouping — 2,65,000 rather than 265,000. Built once because the
 * count-up formats on every scrubbed frame.
 */
const IN_NUMBER = new Intl.NumberFormat("en-IN");

type Stat = {
  value: number;
  /** Rides straight off the digits, at the same size — the "+" in "850+". */
  suffix?: string;
  /** Rides off the digits at a much smaller size — "sq ft", "km". */
  unit?: string;
  label: string;
};

/** Beat 2, on the left while the truck holds the right lane. */
const FLEET_STATS: Stat[] = [
  { value: 850, suffix: "+", label: "Trucks on the road" },
  { value: 90000, unit: "sq ft", label: "Truck yard" },
  { value: 265000, unit: "sq ft", label: "Warehousing in development" },
  { value: 9000, unit: "km", label: "Avg. monthly run per vehicle" },
];

/** Beat 3, on the right while the truck holds the left lane. */
const FACILITY_STATS: Stat[] = [
  { value: 850, suffix: "+", label: "Active vehicles" },
  { value: 8, label: "Facilities" },
  { value: 2, label: "Petrol pumps" },
];

/**
 * The closing beat's copy. Laid out exactly like `MISSION` — same component,
 * same classes — so the sequence bookends itself.
 */
const CLOSING = {
  title: "Tracked end to end.",
  body: "Each truck on the network reports its own position, so the ETA keeps itself current — no chasing drivers, and no freight going quiet between two depots.",
};

const ENDING = {
  title: "Ready when you are.",
  body: "Tell us the lane, the load and the date. We come back with capacity and a price, usually the same day.",
  cta: { label: "Get a quote", href: "/contact" },
};

/** Shared by the opening and closing headlines so the two read as a pair. */
const DISPLAY_HEADING =
  "font-bold uppercase leading-[0.95] tracking-tight text-balance";

/**
 * ============================================================================
 * TRUCK SEQUENCE
 * ============================================================================
 * One tall scroll container whose inner stage is pinned while three beats play
 * out against scroll position. Every number it runs on lives in `config.ts`.
 *
 * The whole thing is a single scrubbed timeline whose duration equals the pin
 * distance in viewport heights, so a phase's budget in the config is literally
 * the scroll it gets. The door split (see `IntroDoors`) is scrubbed against the
 * same scroll range, which is why the first phase here is empty — the truck is
 * holding still behind the doors.
 *
 * Only transforms and opacity are animated. Elements that GSAP moves are always
 * nested inside a separately positioned wrapper, so a Tailwind `-translate-y-1/2`
 * and a GSAP `y` never fight over the same `transform`.
 */
export function TruckSequence() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // `globals.css` sets `scroll-behavior: smooth` site-wide, which fights
  // ScrollTrigger's own scroll corrections around a pin. Opt out while the
  // sequence is mounted, then hand the page back exactly as it was.
  useEffect(() => {
    if (reduced) return;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [reduced]);

  // Webfonts and the truck art both land after first paint and both change
  // measurements the pin was built from, so remeasure once each has settled.
  useEffect(() => {
    if (reduced) return;
    let live = true;
    const refresh = () => {
      if (live) ScrollTrigger.refresh();
    };
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      live = false;
      window.removeEventListener("load", refresh);
    };
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return;
      const stage = stageRef.current;
      const section = sectionRef.current;
      if (!stage || !section) return;

      const mm = gsap.matchMedia();

      const queries = {
        isDesktop: DESKTOP_QUERY,
        isMobile: MOBILE_QUERY,
        isWide: WIDE_QUERY,
      };

      mm.add(queries, (context) => {
        const { isDesktop, isWide } = context.conditions as {
          isDesktop: boolean;
          isWide: boolean;
        };

        const lane = isDesktop
          ? SEQUENCE.lane.offset
          : SEQUENCE.lane.offsetMobile;
        const tilt = isDesktop ? SEQUENCE.lane.tilt : SEQUENCE.lane.tiltMobile;
        const drift = isDesktop
          ? SEQUENCE.truck.drift
          : SEQUENCE.truck.driftMobile;

        const plan = buildTimeline(isWide, SERVICES.length);
        const { start, duration } = plan;
        const { band, night, stageText } = SEQUENCE;
        const width = () => stage.clientWidth;
        const height = () => stage.clientHeight;
        const vh = (value: number) => () => (height() * value) / 100;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${plan.total * window.innerHeight}`,
            pin: stage,
            scrub: SEQUENCE.scrub,
            invalidateOnRefresh: true,
            snap: {
              snapTo: frameSnap(plan),
              duration: band.snap.duration,
              delay: band.snap.delay,
              ease: band.snap.ease,
            },
          },
        });

        // Holds the timeline open for the entire pin, so timeline time and the
        // config's viewport-height budget stay 1:1 whatever the beats do.
        tl.to({}, { duration: plan.total }, 0);

        const beat1 = start.beat1;
        const beat2 = start.beat2;
        const beat3 = start.beat3;

        // --- Beat 1: the truck drifts back while the copy parallaxes away ---
        tl.to(
          "[data-truck-body]",
          { y: () => height() * drift, duration: duration.beat1 },
          beat1,
        );
        stageTextExit(tl, "mission", beat1, duration.beat1, height);

        // --- Beat 2: lane change right, figures count up on the left --------
        laneChange(tl, beat2, duration.beat2, () => width() * lane, tilt);
        // Settle the beat-1 drift back to the middle as it goes.
        tl.to(
          "[data-truck-body]",
          {
            y: 0,
            duration: duration.beat2 * SEQUENCE.lane.moveShare,
            ease: "power1.inOut",
          },
          beat2,
        );

        // Figures arrive from the truck's old side, so they read as filling
        // the space it just vacated.
        statsBeat(tl, "fleet", FLEET_STATS, beat2, duration.beat2, -1, stage);

        // --- Beat 3: lane change left, figures count up on the right --------
        laneChange(tl, beat3, duration.beat3, () => -width() * lane, -tilt);
        statsBeat(
          tl,
          "facility",
          FACILITY_STATS,
          beat3,
          duration.beat3,
          1,
          stage,
        );

        // --- Recenter: the truck retakes the middle lane --------------------
        laneChange(tl, start.recenter, duration.recenter, () => 0, tilt);

        // --- Closing: the hero's own layout, replayed from the centre -------
        // Same component, same classes, truck in the same place the hero left
        // it — so this reads as a bookend rather than a third variation.
        const closing = start.closing;
        tl.fromTo(
          '[data-text="closing-title"], [data-text="closing-body"]',
          { autoAlpha: 0, y: stageText.rise },
          {
            autoAlpha: 1,
            y: 0,
            duration: duration.closing * (stageText.in[1] - stageText.in[0]),
            ease: "power2.out",
          },
          closing + duration.closing * stageText.in[0],
        );

        const closingExit = closing + duration.closing * stageText.exitAt;
        const closingSpan = duration.closing * (1 - stageText.exitAt);
        tl.to(
          "[data-truck-body]",
          { y: () => height() * drift, duration: closingSpan },
          closingExit,
        );
        stageTextExit(tl, "closing", closingExit, closingSpan, height);

        // --- Band in: the panel rises until it covers the whole stage --------
        // Hand back the visibility the markup withholds, in the same frame the
        // `fromTo` below parks the band under the stage, so it is never seen
        // sitting over the hero.
        gsap.set("[data-band]", { visibility: "inherit" });
        tl.fromTo(
          "[data-band]",
          { y: height },
          {
            y: vh(BAND_COVER_VH),
            duration: duration.bandIn,
            ease: band.ease,
          },
          start.bandIn,
        );

        // Undo beat 3's drift while the band is over the stage, so the truck
        // is back at dead centre when the band lifts off it at night.
        tl.to(
          "[data-truck-body]",
          {
            y: 0,
            duration: duration.frames * 0.3,
            ease: "power1.inOut",
          },
          start.frames,
        );

        // --- Frames: each one exits up-left as the next enters bottom-right --
        // The travel angle is the band's own slant angle, so the cards move
        // parallel to the edges the panel is cut with.
        const travel = isWide
          ? band.frameTravel
          : band.frameTravelMobile;
        const angle = () =>
          Math.atan((height() * band.slantVh) / 100 / width());
        const dx = () => width() * travel * Math.cos(angle());
        const dy = () => width() * travel * Math.sin(angle());

        const frameCards = (frame: number[]) =>
          frame.map((card) => `[data-card="${card}"]`).join(", ");

        // The opening frame is already settled when the band arrives.
        gsap.set(frameCards(plan.frames[0]), { autoAlpha: 1, x: 0, y: 0 });

        plan.frames.forEach((frame, index) => {
          const next = plan.frames[index + 1];
          if (!next) return;

          const crossing = plan.framePhase * band.transitionShare;
          const at = start.frames + (index + 1) * plan.framePhase - crossing;

          tl.to(
            frameCards(frame),
            {
              autoAlpha: 0,
              x: () => -dx(),
              y: () => -dy(),
              duration: crossing,
              ease: band.ease,
            },
            at,
          ).fromTo(
            frameCards(next),
            { autoAlpha: 0, x: dx, y: dy },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: crossing,
              ease: band.ease,
            },
            at,
          );
        });

        // --- Band out: lifts clear, the truck is where it was left -----------
        tl.to(
          "[data-band]",
          {
            y: vh(-BAND_HEIGHT_VH),
            duration: duration.bandOut,
            ease: band.ease,
          },
          start.bandOut,
        );

        // --- Night falls while the band is covering the stage ----------------
        // Done as an opacity tween on a black layer rather than a
        // `backgroundColor` tween: it keeps the animation to opacity alone, and
        // keeps the colour itself a palette token in the markup instead of a
        // hex literal in here (see the rules at the top of `globals.css`).
        tl.to(
          "[data-night]",
          {
            opacity: 1,
            duration: duration.frames * night.darkenShare,
          },
          start.frames,
        );

        // --- Switch-on: the lamps strike, then the beams reach out -----------
        const flickerAt = start.night + duration.night * night.flicker[0];
        const flickerFor =
          duration.night * (night.flicker[1] - night.flicker[0]);

        tl.to(
          "[data-bulb]",
          {
            // Stepped, so it jumps between values like a striking lamp instead
            // of cross-fading through them.
            keyframes: { opacity: [...night.flickerSteps], ease: "steps(1)" },
            duration: flickerFor,
          },
          flickerAt,
        ).to(
          "[data-tail]",
          { opacity: night.tail.opacity, duration: flickerFor },
          flickerAt,
        );

        tl.fromTo(
          "[data-beam]",
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1,
            opacity: 1,
            duration: duration.night * (night.beams[1] - night.beams[0]),
            ease: night.ease,
          },
          start.night + duration.night * night.beams[0],
        );

        // --- Process: the truck pulls aside, the workflow runs down the far
        // side. Deeper than a lane change, because seven rows need the room.
        const process = SEQUENCE.process;
        const shift = isDesktop
          ? process.truckShift
          : process.truckShiftMobile;

        laneChange(
          tl,
          start.process,
          duration.process,
          () => -width() * shift,
          -tilt,
        );

        tl.fromTo(
          "[data-process]",
          { autoAlpha: 0, x: process.slide },
          {
            autoAlpha: 1,
            x: 0,
            duration: duration.process * (process.in[1] - process.in[0]),
            ease: "power2.out",
            stagger: process.stagger,
          },
          start.process + duration.process * process.in[0],
        );

        tl.to(
          "[data-process]",
          {
            autoAlpha: 0,
            x: process.slide * 0.5,
            duration: duration.process * (process.out[1] - process.out[0]),
            ease: "power2.in",
            stagger: process.stagger * 0.5,
          },
          start.process + duration.process * process.out[0],
        );

        // --- Ending: the truck retakes the centre, then the closing copy -----
        laneChange(tl, start.ending, duration.ending, () => 0, tilt);
        blockIn(
          tl,
          '[data-block="ending"]',
          start.ending,
          duration.ending,
          SEQUENCE.copy.slide,
        );

        // Then it drives on, up and out of the top. Measured off the truck's
        // own box rather than guessed at, so it clears whatever size the art
        // is set to. Runs to the very end of the timeline, borrowing the outro
        // hold instead of asking for a phase of its own.
        const truckBody = stage.querySelector<HTMLElement>("[data-truck-body]");
        const exitAt = start.ending + duration.ending * SEQUENCE.ending.exitAt;
        tl.to(
          "[data-truck-body]",
          {
            y: () =>
              -(
                height() / 2 +
                (truckBody?.offsetHeight ?? 0) / 2 +
                SEQUENCE.ending.exitClearance
              ),
            duration: plan.total - exitAt,
            ease: SEQUENCE.ending.exitEase,
          },
          exitAt,
        );

        // --- Obstacles: sparse traffic the lane changes are avoiding ---------
        SEQUENCE.obstacles.forEach((obstacle, index) => {
          const at =
            start[obstacle.phase] +
            duration[obstacle.phase] * obstacle.at;
          const x = () => width() * lane * obstacle.lane;

          tl.fromTo(
            `[data-obstacle="${index}"]`,
            { autoAlpha: 1, x, y: () => -height() * 0.62 },
            {
              autoAlpha: 1,
              x,
              y: () => height() * 0.62,
              duration: obstacle.travel,
            },
            at,
          );
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  if (reduced) {
    return <StaticSequence ref={sectionRef} />;
  }

  return (
    <section ref={sectionRef} className="relative z-0">
      <div
        ref={stageRef}
        className="relative h-screen w-full overflow-hidden bg-surface text-on-surface"
        style={
          {
            "--truck-h": `${SEQUENCE.truck.heightMobile}px`,
            "--truck-h-md": `${SEQUENCE.truck.height}px`,
          } as CSSProperties
        }
      >
        {/* Nightfall. Sits under the truck and the copy, over the stage's own
            light background, and is faded up while the band hides the stage. */}
        <div
          data-night
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-primary opacity-0"
        />

        {SEQUENCE.obstacles.map((obstacle, index) => (
          <Centred key={index}>
            {/* `opacity-0` only covers the gap before GSAP parks these above
                the stage; the timeline sets them visible from then on. */}
            <div data-obstacle={index} className="opacity-0">
              <Obstacle kind={obstacle.kind} />
            </div>
          </Centred>
        ))}

        <Centred className="z-10">
          <div data-truck-lane>
            {/* `relative` so the lamps can be placed against the truck's own
                box. They are inside this wrapper, so they inherit every drift,
                lane change and tilt for free. */}
            <div data-truck-body className="relative">
              <Truck />
              <Headlights />
            </div>
          </div>
        </Centred>

        {/* Beat 1 — the opening copy, already in place behind the doors. */}
        <StageText
          id="mission"
          level="h1"
          headline={MISSION.title}
          description={MISSION.body}
        />

        {/* Beat 3 — the same layout, the same classes, played from centre. */}
        <StageText
          id="closing"
          headline={CLOSING.title}
          description={CLOSING.body}
          hidden
        />

        {/* Both figure sets sit on the side the truck has just left. Below
            `md` they drop under the truck instead — there is no room for a
            grid alongside it at phone widths. */}
        <div className="absolute bottom-1/2 translate-y-1/2 left-5 right-5 z-20 md:bottom-auto md:left-[6vw] md:right-auto md:top-1/2 md:max-w-[24rem] md:-translate-y-1/2 lg:max-w-[30rem]">
          <StatGrid id="fleet" items={FLEET_STATS} className="grid-cols-1 md:grid-cols-2 max-w-40 md:max-w-none" animated />
        </div>

        <div className="absolute bottom-[6%] left-5 right-5 z-20 md:bottom-auto md:left-auto md:right-[6vw] md:top-1/2 md:max-w-[20rem] md:-translate-y-1/2">
          <StatGrid
            id="facility"
            items={FACILITY_STATS}
            className="grid-cols-3 md:grid-cols-1 md:text-right"
            animated
          />
        </div>

        {/* The workflow, down the side the truck has pulled away from. It only
            ever shows on the blacked-out stage, so its colours are the
            `on-primary` pair rather than the stage's light-theme tokens. */}
        <div className="absolute right-4 top-1/2 z-20 w-[62%] -translate-y-1/2 md:right-[5vw] md:w-auto md:max-w-[26rem] lg:max-w-[38rem]">
          <ProcessList animated />
        </div>

        {/* Ending sits as one stack to the truck's right on wide screens.
            Below `md` it splits to the hero's own two corners instead — the
            box spans the same 10% insets the hero copy uses, and the flex
            column pushes the headline to the top and the description and CTA
            to the bottom.

            `z-5` rather than the `z-20` the other copy uses: this is the one
            block the truck drives over on its way out, so it has to sit under
            the truck (`z-10`) while staying above the night layer. */}
        <div className="absolute bottom-[10%] left-5 right-5 top-[10%] z-5 md:bottom-auto md:left-auto md:right-[6vw] md:top-1/2 md:max-w-[30ch] md:-translate-y-1/2">
          <div
            data-block="ending"
            className="invisible flex h-full flex-col justify-between opacity-0 md:block md:h-auto"
          >
            <EndingBlock />
          </div>
        </div>

        <ServicesBand />
      </div>
    </section>
  );
}

/**
 * Keeps a service frame from coming to rest half-swapped. It only bites inside
 * the frames phase; everywhere else the natural scroll position is handed back
 * untouched, so the beats and the band's own travel still scroll freely.
 */
function frameSnap(plan: TimelinePlan) {
  const { start, duration, total, framePhase } = plan;
  const from = start.frames / total;
  const to = (start.frames + duration.frames) / total;
  // Rest each frame in the middle of its hold, clear of both transitions.
  const hold = (framePhase * (1 - SEQUENCE.band.transitionShare)) / 2;
  const rest = plan.frames.map(
    (_, index) => (start.frames + index * framePhase + hold) / total,
  );

  return (value: number) => {
    if (value <= from || value >= to) return value;
    return rest.reduce(
      (best, point) =>
        Math.abs(point - value) < Math.abs(best - value) ? point : best,
      rest[0],
    );
  };
}

/**
 * A lane change: ease across, yaw into the turn, straighten up on arrival.
 * `tilt` carries the sign, so a move left leans left.
 */
function laneChange(
  tl: gsap.core.Timeline,
  at: number,
  beat: number,
  x: () => number,
  tilt: number,
) {
  const move = beat * SEQUENCE.lane.moveShare;

  tl.to(
    "[data-truck-lane]",
    { x, duration: move, ease: SEQUENCE.lane.ease },
    at,
  )
    .to(
      "[data-truck-body]",
      { rotation: tilt, duration: move / 2, ease: "power2.out" },
      at,
    )
    .to(
      "[data-truck-body]",
      { rotation: 0, duration: move / 2, ease: "power2.in" },
      at + move / 2,
    );
}

function blockIn(
  tl: gsap.core.Timeline,
  target: string,
  at: number,
  beat: number,
  from: number,
) {
  const [start, end] = SEQUENCE.copy.blockIn;
  tl.fromTo(
    target,
    { autoAlpha: 0, x: from },
    {
      autoAlpha: 1,
      x: 0,
      duration: beat * (end - start),
      ease: "power2.out",
    },
    at + beat * start,
  );
}

/**
 * One figure beat, start to finish: the cards arrive one after another, the
 * numbers run, and the whole set is gone before the beat ends.
 *
 * `side` is -1 for a set on the left, 1 for one on the right — it only sets
 * which way they slide, since each set is placed by CSS on the side the truck
 * has just left. Both beats run through here, so the two behave identically
 * however long their phases are: every window in `SEQUENCE.stats` is a
 * fraction of the beat it is given.
 */
function statsBeat(
  tl: gsap.core.Timeline,
  id: string,
  items: Stat[],
  at: number,
  beat: number,
  side: -1 | 1,
  scope: HTMLElement,
) {
  const stats = SEQUENCE.stats;
  const cards = `[data-stat="${id}"]`;
  const from = stats.slide * side;

  tl.fromTo(
    cards,
    { autoAlpha: 0, x: from },
    {
      autoAlpha: 1,
      x: 0,
      duration: beat * (stats.in[1] - stats.in[0]),
      ease: "power2.out",
      stagger: stats.stagger,
    },
    at + beat * stats.in[0],
  );

  gsap.utils
    .toArray<HTMLElement>(`[data-stat-value="${id}"]`, scope)
    .forEach((el, index) => {
      const counter = { value: 0 };
      tl.to(
        counter,
        {
          value: items[index].value,
          duration: beat * (stats.countUp[1] - stats.countUp[0]),
          ease: "power1.out",
          // Formatted on every frame, so the grouping settles into place as
          // the figure climbs rather than only appearing at the end.
          onUpdate: () => {
            el.textContent = IN_NUMBER.format(Math.round(counter.value));
          },
        },
        at + beat * stats.countUp[0] + index * stats.stagger,
      );
    });

  // Gone before the truck starts moving again.
  tl.to(
    cards,
    {
      autoAlpha: 0,
      x: from * 0.6,
      duration: beat * (stats.out[1] - stats.out[0]),
      ease: "power2.in",
      stagger: stats.stagger * 0.75,
    },
    at + beat * stats.out[0],
  );
}

/**
 * The stage copy's exit: it rises faster than the truck beneath it, the
 * description lagging the headline, and both fade on the way out.
 *
 * Shared by the opening and closing beats, so "same parallax as the hero" is
 * enforced by there being one implementation rather than two that agree.
 */
function stageTextExit(
  tl: gsap.core.Timeline,
  id: string,
  at: number,
  span: number,
  height: () => number,
) {
  const { rise, riseDamp, fadeStart } = SEQUENCE.copy;

  tl.to(
    `[data-text="${id}-title"]`,
    { y: () => -height() * rise, duration: span },
    at,
  )
    .to(
      `[data-text="${id}-body"]`,
      { y: () => -height() * rise * riseDamp, duration: span },
      at,
    )
    .to(
      `[data-text="${id}-title"], [data-text="${id}-body"]`,
      { autoAlpha: 0, duration: span * (1 - fadeStart) },
      at + span * fadeStart,
    );
}

/** Centres a layer over the stage without putting a transform on it. */
function Centred({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Truck() {
  return (
    <Image
      src={TRUCK_SRC}
      alt="A Dot Truckers long-haul truck seen from above"
      width={600}
      height={600}
      priority
      className=" rotate-180 "
    />
  );
}

/** Left lamp, right lamp. */
const SIDES = [-1, 1];

/**
 * Beams, headlamps and tail lamps laid over the truck's own box, so they ride
 * along with it. The truck artwork itself is untouched.
 *
 * Geometry is percentages of that box and comes from the config, because
 * lining beams up with a raster truck is done by eye. The visual side —
 * trapezoid, gradient, blur, blend mode — lives in `globals.css`, which is
 * also where the two non-palette light colours are declared.
 *
 * The truck is flipped to face up, so its nose is at the TOP of the box and
 * the beams throw upward from there.
 *
 * `lit` is the static switched-on state used by the reduced-motion layout.
 * Otherwise the timeline drives `[data-beam]`, `[data-bulb]` and `[data-tail]`
 * with nothing but opacity and `scaleY`.
 */
function Headlights({ lit = false }: { lit?: boolean }) {
  const { lamp, tail, beam, beamBlur } = SEQUENCE.night;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", lit && "night-lit")}
      style={
        {
          "--beam-near": `${beam.near}%`,
          "--beam-far": `${beam.far}%`,
          "--beam-length": `${beam.length}%`,
          "--beam-bottom": `${100 - lamp.top}%`,
          "--beam-blur": `${beamBlur}px`,
        
          "--lamp-top": `${lamp.top}%`,
          "--lamp-glow": `${lamp.glow}px`,
          "--tail-size": `${tail.size}%`,
          "--tail-bottom": `${tail.bottom}%`,
          "--tail-glow": `${tail.glow}px`,
          // A string, so it cannot be mistaken for a length and get `px`.
          "--tail-opacity": `${tail.opacity}`,
        } as CSSProperties
      }
    >
      {SIDES.map((side) => (
        <div
          key={`beam${side}`}
          data-beam
          className="night-beam"
          style={{ "--beam-inset": `${side * lamp.inset}%` } as CSSProperties}
        />
      ))}
      {SIDES.map((side) => (
        <div
          key={`bulb${side}`}
          data-bulb
          className="night-bulb"
          style={{ "--lamp-inset": `${side * lamp.inset}%` } as CSSProperties}
        />
      ))}
      {SIDES.map((side) => (
        <div
          key={`tail${side}`}
          data-tail
          className="night-tail"
          style={{ "--lamp-inset": `${side * tail.inset}%` } as CSSProperties}
        />
      ))}
    </div>
  );
}

function Obstacle({ kind }: { kind: "cone" | "barrier" }) {
  return kind === "cone" ? (
    <TrafficCone className="h-11 w-11 text-accent" />
  ) : (
    <Barrier className="h-8 w-32 text-on-muted" />
  );
}

/**
 * The one description of the stage's copy type. Both the opening and closing
 * beats read these, and so does the reduced-motion layout, so there is no
 * second set of classes that can drift out of step.
 */
const STAGE_TITLE_TYPE = "text-4xl sm:text-5xl md:text-6xl lg:text-7xl";
const STAGE_BODY_TYPE =
  "text-sm text-right text-on-muted md:text-left md:text-lg md:leading-relaxed";

/**
 * ============================================================================
 * STAGE TEXT
 * ============================================================================
 * The stage's two-corner copy layout: headline top-left, description
 * bottom-right on wide screens; stacked above and below the truck once the
 * lanes get narrow.
 *
 * Extracted so the opening beat and the closing one are the same layout by
 * construction rather than by two sets of hand-matched classes. `id` is the
 * handle the timeline animates against — `[data-text="<id>-title"]` and
 * `[data-text="<id>-body"]` — which is why the positioned wrappers stay bare:
 * GSAP moves the inner div, never the box that places it.
 *
 * `hidden` is for copy that has to arrive later. The hero's is simply there,
 * waiting behind the doors.
 */
function StageText({
  id,
  headline,
  description,
  level = "h2",
  hidden = false,
}: {
  id: string;
  headline: string;
  description: string;
  level?: "h1" | "h2";
  hidden?: boolean;
}) {
  const Heading = level;
  const veil = hidden ? "invisible opacity-0" : undefined;

  return (
    <>
      <div className="absolute left-5 right-5 top-[10%] z-20 md:left-[6vw] md:right-auto md:top-[17%] md:max-w-[15ch]">
        <div data-text={`${id}-title`} className={veil}>
          <Heading className={cn(DISPLAY_HEADING, STAGE_TITLE_TYPE)}>
            {headline}
          </Heading>
        </div>
      </div>

      <div className="absolute bottom-[10%] left-5 right-5 z-20 md:bottom-[17%] md:left-auto md:right-[6vw] md:max-w-[36ch]">
        <div data-text={`${id}-body`} className={veil}>
          <p className={STAGE_BODY_TYPE}>{description}</p>
        </div>
      </div>
    </>
  );
}

/**
 * Only ever seen against the night stage, so its colours are the `on-primary`
 * pair rather than the stage's own light-theme text tokens.
 */
function EndingBlock() {
  return (
    // A fragment, not a wrapper: the parent is a flex column below `md`, and
    // it needs exactly these two children to push to its two ends.
    <>
      <h2 className={cn(DISPLAY_HEADING, STAGE_TITLE_TYPE, "text-on-primary")}>
        {ENDING.title}
      </h2>

      {/* `mt-4` is for the stacked reduced-motion layout. In the flex column
          it is absorbed by the free space and changes nothing. */}
      <div className="mt-4 text-right md:text-left">
        <p className="text-sm text-on-primary/70 md:text-lg md:leading-relaxed">
          {ENDING.body}
        </p>
        <ButtonLink
          href={ENDING.cta.href}
          variant="accent"
          size="lg"
          className="mt-5 md:mt-7"
        >
          {ENDING.cta.label}
        </ButtonLink>
      </div>
    </>
  );
}

/**
 * Beat 2's figures, two across. `animated` renders each number as a zero for
 * the timeline to drive and hides each card until its turn; without it the
 * finished figures are printed straight into the markup.
 *
 * The unit rides at the end of the number line at a much smaller size, so a
 * six-digit figure plus "sq ft" still fits a column at 375px.
 */
function StatGrid({
  id,
  items,
  className,
  animated = false,
}: {
  /** Handle the timeline animates against: `[data-stat="<id>"]`. */
  id: string;
  items: Stat[];
  className?: string;
  animated?: boolean;
}) {
  return (
    <dl className={cn("grid gap-x-5 gap-y-7 md:gap-x-8 md:gap-y-10", className)}>
      {items.map((stat) => (
        <div
          key={stat.label}
          data-stat={animated ? id : undefined}
          className={animated ? "invisible opacity-0" : undefined}
        >
          <dd className="font-ui text-2xl font-bold tracking-tight tabular-nums sm:text-3xl lg:text-5xl">
            <span data-stat-value={animated ? id : undefined}>
              {animated ? 0 : IN_NUMBER.format(stat.value)}
            </span>
            {stat.suffix}
            {stat.unit ? (
              <span className="ml-1.5 text-sm  font-semibold tracking-normal text-on-muted sm:text-base">
                {stat.unit}
              </span>
            ) : null}
          </dd>
          <dt className="mt-1.5 font-ui text-xs font-semibold uppercase tracking-[0.1em] text-on-muted">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/**
 * Reduced motion: the whole sequence stacked and still. No pin, no scrub, no
 * band and no obstacles.
 *
 * It keeps the story's arc — the daylight beats, then night — as two plain
 * sections, because the animated version's ending is only legible on black.
 * The truck lives in the night half so there is still exactly one of them, and
 * its lamps are simply switched on rather than flickered.
 */
function StaticSequence({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className="relative z-0">
      <div className="bg-surface text-on-surface">
        <Container className="py-20 lg:py-28">
          {/* The two-corner layout needs a pinned stage to make sense, so
              here the same copy simply stacks. Type comes from the shared
              constants, so it still matches the animated version. */}
          <div className="max-w-2xl">
            <h1 className={cn(DISPLAY_HEADING, STAGE_TITLE_TYPE)}>
              {MISSION.title}
            </h1>
            <p className={cn("mt-6 md:text-left", STAGE_BODY_TYPE)}>
              {MISSION.body}
            </p>
          </div>

          <div className="mt-16 grid gap-14 md:grid-cols-2">
            <StatGrid
              id="fleet"
              items={FLEET_STATS}
              className="grid-cols-1 md:grid-cols-2"
            />
            <StatGrid
              id="facility"
              items={FACILITY_STATS}
              className="grid-cols-3 md:grid-cols-1"
            />
          </div>

          <div className="mt-16 max-w-2xl">
            <h2 className={cn(DISPLAY_HEADING, STAGE_TITLE_TYPE)}>
              {CLOSING.title}
            </h2>
            <p className={cn("mt-6 md:text-left", STAGE_BODY_TYPE)}>
              {CLOSING.body}
            </p>
          </div>

          <div className="mt-20">
            <ServicesList />
          </div>
        </Container>
      </div>

      <div className="bg-primary text-on-primary">
        <Container className="py-20 lg:py-28">
          <div className="flex justify-center">
            <div
              className="relative z-20"
              style={
                { "--truck-h": `${SEQUENCE.truck.height}px` } as CSSProperties
              }
            >
              <Image
                src={TRUCK_SRC}
                alt="A Dot Truckers long-haul truck seen from above"
                width={500}
                height={500}
                priority
                className="h-(--truck-h) w-(--truck-h) rotate-180"
              />
              <Headlights lit />
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            <ProcessList />
          </div>

          <div className="mt-16 max-w-2xl">
            <EndingBlock />
          </div>
        </Container>
      </div>
    </section>
  );
}
