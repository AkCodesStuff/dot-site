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
    /** Lane change right + the fleet figures count up on the left. */
    beat2: 1.3,
    /** Lane change left + the facility figures count up on the right. */
    beat3: 1.2,
    /** Figures clear and the truck returns to the centre lane. */
    recenter: 0.6,
    /**
     * Closing copy, in the hero's own two-corner layout, with the truck back
     * where the hero left it. Deliberately placed AFTER `recenter` — this beat
     * reads as a bookend to the opening, which only works from dead centre.
     */
    closing: 1.3,
    /** Services band rises from below the stage until it covers it. */
    bandIn: 0.8,
    /** Band lifts away, revealing the truck parked where it started. */
    bandOut: 0.8,
    /** Lamps strike and the beams reach out into the dark. */
    night: 0.6,
    /** Truck pulls aside; the seven-step workflow runs down the far side. */
    process: 1.4,
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

  /**
   * The two-corner stage copy — headline top-left, description bottom-right.
   * Used by the opening beat and, unchanged, by the closing one, so the two
   * are the same layout by construction (see `StageText`).
   */
  copy: {
    /** Exit rise, as a fraction of stage height. The description rises less,
     *  which is what makes the pair read as parallax against the truck. */
    rise: 0.42,
    riseDamp: 0.65,
    /** How far into the exit the copy starts fading. */
    fadeStart: 0.55,
    /** Slide-in distance for the ending block, in px. */
    slide: 48,
    /** When a block arrives, as fractions of its own beat. */
    blockIn: [0.22, 0.6],
  },

  /**
   * The closing beat's copy. It has to arrive first (the hero's was simply
   * there behind the doors), then leave on exactly the hero's parallax.
   */
  stageText: {
    /** Arrival window, as fractions of the beat. */
    in: [0.05, 0.32],
    /** Distance it rises through as it arrives, px. */
    rise: 36,
    /** When the parallax exit starts. It runs to the end of the beat. */
    exitAt: 0.5,
  },

  /**
   * The figure beats. Both sets run on these numbers — beat 2's fleet figures
   * on the left while the truck holds the right lane, beat 3's facility
   * figures on the right while it holds the left. Each set always sits on the
   * side the truck has just left, so the two never contend for space.
   *
   * Every window is a fraction of its OWN beat, which is why one set of
   * numbers drives two beats of different lengths.
   */
  stats: {
    /** Arrival and departure windows, as fractions of the beat. */
    in: [0.18, 0.55],
    out: [0.72, 0.92],
    /** Delay between cards, in timeline units (viewport heights). */
    stagger: 0.04,
    /** Slide distance on the way in, px. They leave on a shorter one. */
    slide: 56,
    /** When the numbers run. Finishes before the cards go. */
    countUp: [0.24, 0.72],
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

  /**
   * The workflow list, on the night stage with the lamps already lit.
   *
   * The truck pulls further aside here than a lane change would take it —
   * seven rows need more room than a lane's worth of clearance, and on a phone
   * the only way they fit is for the truck to sit mostly out of frame.
   */
  process: {
    /** How far LEFT the truck pulls, as a fraction of stage width. */
    truckShift: 0.3,
    truckShiftMobile: 0.38,
    /** Arrival and departure windows, as fractions of the beat. */
    in: [0.14, 0.55],
    out: [0.82, 1],
    /** Delay between rows, in timeline units (viewport heights). */
    stagger: 0.03,
    /** Slide distance on the way in, px. They leave on a shorter one. */
    slide: 40,
  },

  /**
   * The same seven steps below `md`, where a vertical list has nowhere near
   * enough width to read. They ride a semicircle whose centre sits ON the
   * right edge of the wheel's box — so the arc is exactly the left half of a
   * circle, bulging into the screen and closing on itself at the edge.
   *
   * Scroll turns the wheel by one step per item, linearly, so it tracks the
   * scrollbar exactly. Distance from the centre of the arc drives both scale
   * and opacity, which is what leaves roughly three steps legible at a time
   * and fades the rest away toward the edges.
   */
  wheel: {
    /** Angle between adjacent steps, degrees. */
    step: 26,
    /**
     * Distance from the centre at which a step has faded out entirely. Set
     * against `step` so the middle three read clearly (1, 0.57, 0.13 opacity)
     * and the rest are ghosts — which also means the ones the box clips at its
     * right edge are too faint for the cut to register.
     */
    falloff: 60,
    /** Circle radius as a fraction of the wheel box's own width. */
    radius: 0.95,
    /** Scale at the centre of the arc, and at the far edge. */
    scale: [1, 0.68],
    /** Fade windows for the wheel as a whole, as fractions of the beat. */
    in: [0.05, 0.22],
    out: [0.88, 1],
  },

  /**
   * The close. The truck pulls back to centre, the copy arrives beside it,
   * and then the truck simply drives on — up and out of the top of the frame,
   * over the copy, which stays where it is.
   *
   * The exit runs from partway through the `ending` beat to the very end of
   * `outro`, so it borrows the hold rather than needing a phase of its own.
   */
  ending: {
    /** When the truck starts driving out, as a fraction of the ending beat. */
    exitAt: 0.6,
    /**
     * Clearance past the top edge, px. Added on top of half the stage and
     * half the truck's own measured height, so it always fully clears.
     */
    exitClearance: 48,
    exitEase: "power1.in",
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
  "closing",
  "bandIn",
  "frames",
  "bandOut",
  "night",
  "process",
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
