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
        const { copy, band } = SEQUENCE;
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
        )
          .to(
            '[data-mission="title"]',
            { y: () => -height() * copy.rise, duration: duration.beat1 },
            beat1,
          )
          .to(
            '[data-mission="body"]',
            {
              y: () => -height() * copy.rise * copy.riseDamp,
              duration: duration.beat1,
            },
            beat1,
          )
          .to(
            '[data-mission="title"], [data-mission="body"]',
            {
              autoAlpha: 0,
              duration: duration.beat1 * (1 - copy.fadeStart),
            },
            beat1 + duration.beat1 * copy.fadeStart,
          );

        // --- Beat 2: lane change right, stats count up on the left ----------
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
        blockIn(tl, '[data-block="stats"]', beat2, duration.beat2, -copy.slide);

        gsap.utils
          .toArray<HTMLElement>("[data-stat-value]", stage)
          .forEach((el, index) => {
            const counter = { value: 0 };
            tl.to(
              counter,
              {
                value: STATS[index].value,
                duration:
                  duration.beat2 * (copy.countUp[1] - copy.countUp[0]),
                ease: "power1.out",
                onUpdate: () => {
                  el.textContent = String(Math.round(counter.value));
                },
              },
              beat2 +
                duration.beat2 * copy.countUp[0] +
                index * copy.countStagger,
            );
          });

        // --- Beat 3: lane change back left, info block on the right ---------
        blockOut(tl, '[data-block="stats"]', beat3, duration.beat3, -copy.slide);
        laneChange(tl, beat3, duration.beat3, () => -width() * lane, -tilt);
        blockIn(tl, '[data-block="info"]', beat3, duration.beat3, copy.slide);

        // --- Recenter: info clears and the truck retakes the middle lane -----
        blockOut(
          tl,
          '[data-block="info"]',
          start.recenter,
          duration.recenter,
          copy.slide,
        );
        laneChange(tl, start.recenter, duration.recenter, () => 0, tilt);

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

        // --- Ending: closing copy and the CTA arrive beside the truck --------
        blockIn(
          tl,
          '[data-block="ending"]',
          start.ending,
          duration.ending,
          copy.slide,
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

        {/* Ending sits to the truck's right on wide screens. Below `md` it
            moves above the truck instead of under it — the CTA button makes
            this block tall enough to collide with the cab otherwise. */}
        <div className="absolute left-5 right-5 top-[8%] z-20 md:left-auto md:right-[6vw] md:top-1/2 md:max-w-[30ch] md:-translate-y-1/2">
          <div data-block="ending" className="invisible opacity-0">
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
      width={600}
      height={600}
      priority
      className=" rotate-180 "
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
    <h1
      className={cn(
        DISPLAY_HEADING,
        "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
      )}
    >
      {MISSION.title}
    </h1>
  );
}

function EndingBlock() {
  return (
    <div>
      <h2
        className={cn(
          DISPLAY_HEADING,
          "text-3xl sm:text-4xl md:text-6xl lg:text-7xl",
        )}
      >
        {ENDING.title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-on-muted md:text-lg">
        {ENDING.body}
      </p>
      <ButtonLink
        href={ENDING.cta.href}
        variant="accent"
        size="lg"
        className="mt-7"
      >
        {ENDING.cta.label}
      </ButtonLink>
    </div>
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
 * Reduced motion: the whole sequence stacked and still. No pin, no scrub, no
 * band and no obstacles — the truck sits between the copy it belongs to, the
 * services are a plain list, and the ending is simply there.
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
            className="h-(--truck-h) w-(--truck-h) rotate-180"
            style={{ "--truck-h": `${SEQUENCE.truck.height}px` } as CSSProperties}
          />
        </div>

        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <StatList />
          <InfoBlock />
        </div>

        <div className="mt-20">
          <ServicesList />
        </div>

        <div className="mt-20 max-w-2xl">
          <EndingBlock />
        </div>
      </Container>
    </section>
  );
}
