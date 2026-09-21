"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import type { CSSProperties, ReactNode, Ref } from "react";
import { useEffect, useRef } from "react";

import {
  DESKTOP_QUERY,
  MOBILE_QUERY,
  PHASE_START,
  SEQUENCE,
  TOTAL_VH,
} from "@/components/new-home/config";
import { Barrier, TrafficCone } from "@/components/new-home/RoadArt";
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

const STATS = [
  { value: 850, suffix: "+", label: "Trucks in the fleet" },
  { value: 140, suffix: "+", label: "Cities served" },
  { value: 2017, prefix: "Since ", label: "Moving India's freight" },
];

const INFO = {
  eyebrow: "Pan-India coverage",
  title: "Every load, tracked end to end.",
  body: "Each truck on the network reports its own position, so the ETA keeps itself current — no chasing drivers, and no freight going quiet between two depots.",
};

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

  useGSAP(
    () => {
      if (reduced) return;
      const stage = stageRef.current;
      const section = sectionRef.current;
      if (!stage || !section) return;

      const mm = gsap.matchMedia();

      mm.add({ isDesktop: DESKTOP_QUERY, isMobile: MOBILE_QUERY }, (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };

        const lane = isDesktop
          ? SEQUENCE.lane.offset
          : SEQUENCE.lane.offsetMobile;
        const tilt = isDesktop ? SEQUENCE.lane.tilt : SEQUENCE.lane.tiltMobile;
        const drift = isDesktop
          ? SEQUENCE.truck.drift
          : SEQUENCE.truck.driftMobile;

        const { phases, copy } = SEQUENCE;
        const width = () => stage.clientWidth;
        const height = () => stage.clientHeight;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${TOTAL_VH * window.innerHeight}`,
            pin: stage,
            scrub: SEQUENCE.scrub,
            invalidateOnRefresh: true,
          },
        });

        // Holds the timeline open for the entire pin, so timeline time and the
        // config's viewport-height budget stay 1:1 whatever the beats do.
        tl.to({}, { duration: TOTAL_VH }, 0);

        const beat1 = PHASE_START.beat1;
        const beat2 = PHASE_START.beat2;
        const beat3 = PHASE_START.beat3;
        const outro = PHASE_START.outro;

        // --- Beat 1: the truck drifts back while the copy parallaxes away ---
        tl.to(
          "[data-truck-body]",
          { y: () => height() * drift, duration: phases.beat1 },
          beat1,
        )
          .to(
            '[data-mission="title"]',
            { y: () => -height() * copy.rise, duration: phases.beat1 },
            beat1,
          )
          .to(
            '[data-mission="body"]',
            {
              y: () => -height() * copy.rise * copy.riseDamp,
              duration: phases.beat1,
            },
            beat1,
          )
          .to(
            '[data-mission="title"], [data-mission="body"]',
            {
              autoAlpha: 0,
              duration: phases.beat1 * (1 - copy.fadeStart),
            },
            beat1 + phases.beat1 * copy.fadeStart,
          );

        // --- Beat 2: lane change right, stats count up on the left ----------
        laneChange(tl, beat2, phases.beat2, () => width() * lane, tilt);
        // Settle the beat-1 drift back to the middle as it goes.
        tl.to(
          "[data-truck-body]",
          {
            y: 0,
            duration: phases.beat2 * SEQUENCE.lane.moveShare,
            ease: "power1.inOut",
          },
          beat2,
        );
        blockIn(tl, '[data-block="stats"]', beat2, phases.beat2, -copy.slide);

        gsap.utils
          .toArray<HTMLElement>("[data-stat-value]", stage)
          .forEach((el, index) => {
            const counter = { value: 0 };
            tl.to(
              counter,
              {
                value: STATS[index].value,
                duration:
                  phases.beat2 * (copy.countUp[1] - copy.countUp[0]),
                ease: "power1.out",
                onUpdate: () => {
                  el.textContent = String(Math.round(counter.value));
                },
              },
              beat2 + phases.beat2 * copy.countUp[0] + index * copy.countStagger,
            );
          });

        // --- Beat 3: lane change back left, info block on the right ---------
        blockOut(tl, '[data-block="stats"]', beat3, phases.beat3, -copy.slide);
        laneChange(tl, beat3, phases.beat3, () => -width() * lane, -tilt);
        blockIn(tl, '[data-block="info"]', beat3, phases.beat3, copy.slide);

        // --- Outro: clear the stage before the pin releases ------------------
        tl.to(
          '[data-block="info"]',
          { autoAlpha: 0, duration: phases.outro * 0.6, ease: "power2.in" },
          outro + phases.outro * 0.4,
        );

        // --- Obstacles: sparse traffic the lane changes are avoiding ---------
        SEQUENCE.obstacles.forEach((obstacle, index) => {
          const at =
            PHASE_START[obstacle.phase] +
            SEQUENCE.phases[obstacle.phase] * obstacle.at;
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
            <div data-truck-body>
              <Truck />
            </div>
          </div>
        </Centred>

        {/* Beat 1 — title top-left, body bottom-right; stacked above and below
            the truck once the lanes get narrow. */}
        <div className="absolute left-5 right-5 top-[10%] z-20 md:left-[6vw] md:right-auto md:top-[17%] md:max-w-[15ch]">
          <div data-mission="title">
            <MissionTitle />
          </div>
        </div>
        <div className="absolute bottom-[10%] left-5 right-5 z-20 md:bottom-[17%] md:left-auto md:right-[6vw] md:max-w-[36ch]">
          <div data-mission="body">
            <MissionBody />
          </div>
        </div>

        <div className="absolute bottom-[9%] left-5 right-5 z-20 md:bottom-auto md:left-[6vw] md:right-auto md:top-1/2 md:max-w-[24ch] md:-translate-y-1/2">
          <div data-block="stats" className="invisible opacity-0">
            <StatList animated />
          </div>
        </div>

        <div className="absolute bottom-[9%] left-5 right-5 z-20 md:bottom-auto md:left-auto md:right-[6vw] md:top-1/2 md:max-w-[32ch] md:-translate-y-1/2">
          <div data-block="info" className="invisible opacity-0">
            <InfoBlock />
          </div>
        </div>
      </div>
    </section>
  );
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

function blockOut(
  tl: gsap.core.Timeline,
  target: string,
  at: number,
  beat: number,
  to: number,
) {
  const [start, end] = SEQUENCE.copy.blockOut;
  tl.to(
    target,
    {
      autoAlpha: 0,
      x: to * 0.6,
      duration: beat * (end - start),
      ease: "power2.in",
    },
    at + beat * start,
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
      width={500}
      height={500}
      priority
      className="h-[var(--truck-h)] w-[var(--truck-h)] rotate-180 md:h-[var(--truck-h-md)] md:w-[var(--truck-h-md)]"
    />
  );
}

function Obstacle({ kind }: { kind: "cone" | "barrier" }) {
  return kind === "cone" ? (
    <TrafficCone className="h-11 w-11 text-accent" />
  ) : (
    <Barrier className="h-8 w-32 text-on-muted" />
  );
}

function MissionTitle() {
  return (
    <h1 className="text-4xl font-bold uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
      {MISSION.title}
    </h1>
  );
}

function MissionBody() {
  return (
    <p className="text-base leading-relaxed text-on-muted md:text-lg">
      {MISSION.body}
    </p>
  );
}

/**
 * `animated` renders each number as a zero for GSAP to drive; without it the
 * finished figures are printed straight into the markup.
 */
function StatList({ animated = false }: { animated?: boolean }) {
  return (
    <dl className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-8">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <dd className="font-ui text-3xl font-bold tracking-tight tabular-nums sm:text-4xl lg:text-5xl">
            {stat.prefix}
            <span data-stat-value={animated ? "" : undefined}>
              {animated ? 0 : stat.value}
            </span>
            {stat.suffix}
          </dd>
          <dt className="mt-1.5 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-on-muted">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function InfoBlock() {
  return (
    <div>
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        {INFO.eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-balance sm:text-3xl lg:text-4xl">
        {INFO.title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-on-muted">
        {INFO.body}
      </p>
    </div>
  );
}

/**
 * Reduced motion: the same three beats, stacked and still. No pin, no scrub,
 * no obstacles — the truck simply sits between the copy it belongs to.
 */
function StaticSequence({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <section ref={ref} className="relative z-0 bg-surface text-on-surface">
      <Container className="py-20 lg:py-28">
        <div className="max-w-2xl">
          <MissionTitle />
          <div className="mt-6">
            <MissionBody />
          </div>
        </div>

        <div className="my-14 flex justify-center">
          <Image
            src={TRUCK_SRC}
            alt="A Dot Truckers long-haul truck seen from above"
            width={500}
            height={500}
            priority
            className="h-[var(--truck-h)] w-[var(--truck-h)] rotate-180"
            style={{ "--truck-h": `${SEQUENCE.truck.height}px` } as CSSProperties}
          />
        </div>

        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <StatList />
          <InfoBlock />
        </div>
      </Container>
    </section>
  );
}
