/**
 * ============================================================================
 * /new-home SCROLL SEQUENCE — every timing, distance and offset, in one place
 * ============================================================================
 * Tweak the feel here; the components read these numbers and never hardcode
 * their own.
 *
 * TIME IS MEASURED IN VIEWPORT HEIGHTS, NOT SECONDS.
 * Nothing on this page runs on a clock — every beat is scrubbed against scroll
 * position. The master timeline's duration is set to the sum of `phases`, so
 * one unit of timeline time is exactly one screen of scrolling: `beat2: 1.3`
 * literally means "beat 2 takes 1.3 screens to play through".
 *
 * The phases run in order, and the frames phase is sized from the number of
 * service frames at the current breakpoint, so the total is built per-layout
 * by `buildTimeline()` rather than being a fixed constant.
 */

/** Matches Tailwind's `md:` — copy blocks move beside the truck from here up. */
export const DESKTOP_QUERY = "(min-width: 48rem)";
export const MOBILE_QUERY = "(max-width: 47.999rem)";
/** Matches Tailwind's `lg:` — where the services band goes two cards per frame. */
export const WIDE_QUERY = "(min-width: 64rem)";

export const SEQUENCE = {
  /**
   * Scrub smoothing, in seconds of catch-up. 0 locks motion rigidly to the
   * scrollbar; higher values let it glide to a stop after you stop scrolling.
   */
  scrub: 0.6,

  /**
   * Scroll budget for each phase, in viewport heights. They run in the order
   * listed. The `frames` phase is missing on purpose — it sits between `bandIn`
   * and `bandOut` and is sized from the frame count (see `buildTimeline`).
   */
  phases: {
    /** Doors split apart. The truck holds still behind them. */
    doors: 1,
    /** Mission copy parallaxes away while the truck drifts back. */
    beat1: 1,
    /** Lane change right + stats count up on the left. */
    beat2: 1.3,
    /** Lane change left + info block on the right. */
    beat3: 1.3,
    /** Info block clears and the truck returns to the centre lane. */
    recenter: 0.6,
    /** Services band rises from below the stage until it covers it. */
    bandIn: 0.8,
    /** Band lifts away, revealing the truck parked where it started. */
    bandOut: 0.8,
    /** Lamps strike and the beams reach out into the dark. */
    night: 0.6,
    /** Closing headline, subtext and CTA fade in beside the truck. */
    ending: 0.8,
    /** Breathing room before the pin releases. */
    outro: 0.4,
  },

  doors: {
    /** Mechanical, not jagged: accelerate out of the seam, settle at the edge. */
    ease: "power1.inOut",
  },

  truck: {
    /**
     * Rendered box height in px. The source art is square with wide
     * transparent margins, so the truck itself reads about 23% of this wide
     * and 94% of it tall.
     */
    height: 320,
    heightMobile: 190,
    /** How far the truck drifts down through beat 1, as a fraction of stage height. */
    drift: 0.07,
    driftMobile: 0.05,
  },

  lane: {
    /** Lane offset from centre, as a fraction of stage width. */
    offset: 0.19,
    offsetMobile: 0.17,
    /** Yaw into the turn, in degrees, straightened out by the end of the move. */
    tilt: 8,
    tiltMobile: 8,
    /** Share of the beat spent crossing; the rest is straight running. */
    moveShare: 0.4,
    ease: "power2.inOut",
  },

  copy: {
    /** Beat-1 rise, as a fraction of stage height. The body copy rises less. */
    rise: 0.42,
    riseDamp: 0.65,
    /** How far into beat 1 the mission copy starts fading. */
    fadeStart: 0.55,
    /** Slide-in distance for the stats and info blocks, in px. */
    slide: 48,
    /** When a block arrives and leaves, as fractions of its own beat. */
    blockIn: [0.22, 0.6],
    blockOut: [0.0, 0.25],
    /** When the numbers count up, as fractions of the beat, plus per-stat stagger. */
    countUp: [0.3, 0.9],
    countStagger: 0.06,
  },

  /**
   * The services band: a tall dark panel that rises over the pinned stage,
   * plays its frames, then lifts away.
   *
   * `slantVh` is the single source of the diagonal. It sets the depth of both
   * clipped edges AND the angle the cards travel along, so the two can never
   * drift out of agreement — raise it to steepen both together. Note that the
   * angle is `atan(slant / stage width)`, so on a wide desktop 10vh reads as a
   * shallow ~4°; on a phone the same number is nearer 12°.
   */
  band: {
    /** Depth of the slanted top and bottom edges, in viewport heights. */
    slantVh: 10,
    /**
     * Spare height beyond the minimum needed to keep both slanted edges off
     * screen while the band covers the stage. Without slack, exactly one
     * offset hides them; this widens that to a usable window.
     */
    coverSlackVh: 10,
    /** Cards shown per frame. Four services means 2 frames wide, 4 narrow. */
    cardsPerFrame: 2,
    cardsPerFrameMobile: 1,
    /** Scroll length of one frame — its hold plus its outgoing transition. */
    framePhase: 1,
    framePhaseMobile: 0.65,
    /** Share of a frame's slot spent crossing over to the next one. */
    transitionShare: 0.45,
    /** Diagonal travel distance, as a fraction of stage width. */
    frameTravel: 0.55,
    frameTravelMobile: 0.8,
    ease: "power2.inOut",
    /** Keeps a frame from resting half-swapped once scrolling stops. */
    snap: {
      duration: { min: 0.15, max: 0.4 },
      delay: 0.06,
      ease: "power1.inOut",
    },
  },

  /**
   * Obstacles that scroll down past the truck, sparse on purpose. Each one is
   * timed so it reaches the truck's row just *after* the truck has left that
   * lane, which is what makes the lane changes read as avoidance.
   *
   * `lane`: -1 left, 0 centre, 1 right.
   * `at`:   when it enters the top of the stage, as a fraction of `phase`.
   * `travel`: how many screens of scrolling it takes to cross the stage.
   */
  obstacles: [
   
    { kind: "barrier", lane: 1, phase: "beat2", at: 0.88, travel: 1.5 },
    // { kind: "cone", lane: 0, phase: "beat3", at: 0.5, travel: 1.15 },
  ],

  /**
   * The night ending. The stage goes black while the services band is covering
   * it, so when the band lifts the truck appears to have come out of a tunnel
   * into the dark — then its lights come on.
   *
   * ALL lamp and beam geometry is a percentage of the truck's own square box,
   * which is what you tune to line the beams up with the artwork. Because the
   * box is smaller on mobile, mobile gets proportionally narrower and shorter
   * beams for free — add explicit mobile values only if you want a different
   * beam *shape* there rather than a scaled one.
   */
  night: {
    /** Share of the frames phase spent fading the stage to black. */
    darkenShare: 0.6,
    /** Windows within the night phase, as fractions of it. */
    flicker: [0, 0.4],
    beams: [0.3, 0.9],
    /** Opacity the bulbs jump between as they strike. Stepped, not eased. */
    flickerSteps: [0, 1, 0.3, 1],
    /** Headlamps: offset from the box centre, down from its nose, and size. */
    lamp: { inset: 7.5, top: 5, size: 6, glow: 14 },
    /** Tail lamps: same units, measured up from the box's tail. */
    tail: { inset: 6, bottom: 5, size: 4, glow: 10, opacity: 0.55 },
    /** Beam trapezoid: width at the lamp, width at the throw, and length. */
    beam: { near: 8, far: 46, length: 130 },
    /** Static blur radius, px. Never animated. */
    beamBlur: 11,
    ease: "power2.out",
  },

  intro: {
    /** Seconds for one line-art truck to cross the intro panel. Ambient, not scrubbed. */
    truckCrossing: 16,
  },
} as const;

export type Phase = keyof typeof SEQUENCE.phases | "frames";

const ORDER: Phase[] = [
  "doors",
  "beat1",
  "beat2",
  "beat3",
  "recenter",
  "bandIn",
  "frames",
  "bandOut",
  "night",
  "ending",
  "outro",
];

export type TimelinePlan = {
  /** Absolute timeline time each phase begins, in viewport heights. */
  start: Record<Phase, number>;
  duration: Record<Phase, number>;
  /** Whole pinned scroll budget, in viewport heights. */
  total: number;
  /** Service card indices, grouped into the frames they appear in. */
  frames: number[][];
  /** Scroll length of a single frame at this breakpoint. */
  framePhase: number;
};

/**
 * Lays the phases end to end for one breakpoint. The frames phase is the only
 * variable-length one: fewer, longer frames on a wide screen, more and shorter
 * ones below it.
 */
export function buildTimeline(isWide: boolean, serviceCount: number): TimelinePlan {
  const perFrame = isWide
    ? SEQUENCE.band.cardsPerFrame
    : SEQUENCE.band.cardsPerFrameMobile;
  const framePhase = isWide
    ? SEQUENCE.band.framePhase
    : SEQUENCE.band.framePhaseMobile;

  const frames: number[][] = [];
  for (let i = 0; i < serviceCount; i += perFrame) {
    frames.push(
      Array.from(
        { length: Math.min(perFrame, serviceCount - i) },
        (_, offset) => i + offset,
      ),
    );
  }

  const duration = {
    ...SEQUENCE.phases,
    frames: frames.length * framePhase,
  } as Record<Phase, number>;

  const start = {} as Record<Phase, number>;
  let elapsed = 0;
  for (const phase of ORDER) {
    start[phase] = elapsed;
    elapsed += duration[phase];
  }

  return { start, duration, total: elapsed, frames, framePhase };
}

/**
 * Band height needed to park both slanted edges outside the stage while it
 * covers, plus the slack that turns the one valid offset into a window.
 */
export const BAND_HEIGHT_VH =
  100 + 2 * SEQUENCE.band.slantVh + SEQUENCE.band.coverSlackVh;

/**
 * Where the band sits while covering. Centring it over the stage is also what
 * puts a card centred in the band dead centre of the viewport.
 */
export const BAND_COVER_VH = -(BAND_HEIGHT_VH - 100) / 2;

export const BAND_CLIP_PATH = `polygon(0 ${SEQUENCE.band.slantVh}vh, 100% 0, 100% calc(100% - ${SEQUENCE.band.slantVh}vh), 0 100%)`;
