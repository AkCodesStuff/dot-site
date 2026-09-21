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
 * The phases run in order, so the whole pinned sequence is
 * `doors + beat1 + beat2 + beat3 + outro` screens tall.
 */

/** Matches Tailwind's `md:` breakpoint — the one place the two layouts split. */
export const DESKTOP_QUERY = "(min-width: 48rem)";
export const MOBILE_QUERY = "(max-width: 47.999rem)";

export const SEQUENCE = {
  /**
   * Scrub smoothing, in seconds of catch-up. 0 locks motion rigidly to the
   * scrollbar; higher values let it glide to a stop after you stop scrolling.
   */
  scrub: 0.6,

  /** Scroll budget for each phase, in viewport heights. */
  phases: {
    /** Doors split apart. The truck holds still behind them. */
    doors: 1,
    /** Mission copy parallaxes away while the truck drifts back. */
    beat1: 1,
    /** Lane change right + stats count up on the left. */
    beat2: 1.3,
    /** Lane change left + info block on the right. */
    beat3: 1.3,
    /** Breathing room before the pin releases. */
    outro: 0.5,
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
    offsetMobile: 0.1,
    /** Yaw into the turn, in degrees, straightened out by the end of the move. */
    tilt: 8,
    tiltMobile: 6,
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
   * Obstacles that scroll down past the truck, sparse on purpose. Each one is
   * timed so it reaches the truck's row just *after* the truck has left that
   * lane, which is what makes the lane changes read as avoidance.
   *
   * `lane`: -1 left, 0 centre, 1 right.
   * `at`:   when it enters the top of the stage, as a fraction of `phase`.
   * `travel`: how many screens of scrolling it takes to cross the stage.
   */
  obstacles: [
    { kind: "cone", lane: 0, phase: "beat1", at: 0.85, travel: 1.5 },
    { kind: "barrier", lane: 1, phase: "beat2", at: 0.88, travel: 1.5 },
    { kind: "cone", lane: 0, phase: "beat3", at: 0.5, travel: 1.15 },
  ],

  intro: {
    /** Seconds for one line-art truck to cross the intro panel. Ambient, not scrubbed. */
    truckCrossing: 16,
  },
} as const;

type Phase = keyof typeof SEQUENCE.phases;

/** Absolute timeline time (in viewport heights) at which each phase starts. */
export const PHASE_START: Record<Phase, number> = (() => {
  const order: Phase[] = ["doors", "beat1", "beat2", "beat3", "outro"];
  let elapsed = 0;
  return order.reduce(
    (acc, phase) => {
      acc[phase] = elapsed;
      elapsed += SEQUENCE.phases[phase];
      return acc;
    },
    {} as Record<Phase, number>,
  );
})();

/** Total scroll budget for the pinned stage, in viewport heights. */
export const TOTAL_VH = Object.values(SEQUENCE.phases).reduce((a, b) => a + b, 0);
