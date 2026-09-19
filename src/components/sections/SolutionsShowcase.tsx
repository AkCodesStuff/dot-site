"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type Solution = {
  /** e.g. "DOT Truckers" */
  name: string;
  /** e.g. "FTL Transportation" */
  subtitle: string;
  description: string;
  /** Remote image URL — see next.config.ts remotePatterns. */
  image: string;
  icon: "truck" | "boxes" | "bolt" | "warehouse";
  href: string;
};

/**
 * ============================================================================
 * SOLUTIONS SHOWCASE
 * ============================================================================
 * A heading, then the same solution cards rendered two different ways:
 *
 * - `md` and up: a horizontal scroll-pin gallery. The section is pinned
 *   (`sticky`) for as much extra scroll as it takes to pan the full row past,
 *   so scrolling *is* the horizontal motion — no easing or inertia layered on
 *   top, just a direct 1:1 mapping from scroll position to translateX, the
 *   same "grounded" approach `ScrollVideo` uses for its timeline. The pinned
 *   stage is exactly one viewport tall (100svh) and the heading lives inside
 *   it too — heading on top at its natural height, cards filling whatever is
 *   left below — so heading + cards together fill one screen, rather than
 *   the heading sitting above a *second* full-screen card row.
 * - Below `md` ("on phone"): a static 2x2 mosaic. No scroll trickery — a
 *   photo per tile with a dark tint and the label sitting on the tint at the
 *   bottom of the image, exactly like a phone photo grid.
 *
 * `prefers-reduced-motion` disables the pin/scrub on the gallery (see the
 * `motion-reduce:` overrides below) and falls back to an ordinary
 * horizontally-scrollable row at a normal height, so nothing forces a long
 * empty scroll on someone who has asked for less motion.
 */
export function SolutionsShowcase({
  eyebrow,
  title,
  description,
  solutions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  solutions: Solution[];
}) {
  return (
    <section className="border-b border-border bg-background text-on-background">
      {/* Phone / tablet-portrait heading — normal document flow, not pinned
          (the pinned stage below is `hidden` under `md`). */}
      <Container className="pb-10 pt-16 sm:pb-12 sm:pt-20 md:hidden">
        <SolutionsHeading eyebrow={eyebrow} title={title} description={description} />
      </Container>

      {/* Desktop / tablet-landscape: heading + scroll-pinned gallery, pinned
          together as one 100svh stage. */}
      <ScrollRow
        heading={
          <SolutionsHeading
            eyebrow={eyebrow}
            title={title}
            description={description}
            compact
          />
        }
      >
        {solutions.map((solution) => (
          <SolutionCard key={solution.name} solution={solution} />
        ))}
      </ScrollRow>

      {/* Phone: 2x2 tinted photo mosaic. */}
      <Container className="pb-16 sm:pb-20 md:hidden">
        <div className="grid grid-cols-2 gap-3">
          {solutions.map((solution) => (
            <SolutionTile key={solution.name} solution={solution} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function SolutionsHeading({
  eyebrow,
  title,
  description,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Tighter type scale — used inside the height-constrained pinned stage. */
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        compact && "gap-3 lg:gap-10",
      )}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-3 max-w-md font-semibold tracking-tight text-balance",
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
          )}
        >
          {title}
        </h2>
        <span
          aria-hidden="true"
          className="mt-3 block h-1 w-14 rounded-full bg-accent"
        />
      </div>
      <p
        className={cn(
          "max-w-md leading-relaxed text-on-muted",
          compact ? "text-sm lg:text-base" : "text-base lg:text-lg",
        )}
      >
        {description}
      </p>
    </div>
  );
}

/**
 * The scroll-pin runway. `travel` is measured (not guessed) from the actual
 * rendered width of the row versus the stage, so the extra scroll distance
 * always matches exactly how far the row needs to pan — no matter how many
 * cards are passed in or how wide the viewport is.
 */
function ScrollRow({
  heading,
  children,
}: {
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  // Measure how far the row overhangs the stage, in pixels.
  useEffect(() => {
    const row = rowRef.current;
    const stage = stageRef.current;
    if (!row || !stage) return;

    const measure = () => {
      setTravel(Math.max(0, row.scrollWidth - stage.clientWidth));
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Drive the row's horizontal position directly from scroll position while
  // the wrapper is being pinned. No easing: the row's translateX is always
  // exactly `progress * travel`, so it tracks the scrollbar one for one.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const row = rowRef.current;
    if (!wrapper || !row || travel <= 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      row.style.transform = `translate3d(${(-progress * travel).toFixed(1)}px,0,0)`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [travel]);

  return (
    <div
      ref={wrapperRef}
      style={{ height: `calc(100svh + ${travel}px)` }}
      className="relative hidden md:block motion-reduce:h-auto!"
    >
      <div
        ref={stageRef}
        className={cn(
          "sticky top-0 flex h-svh w-full flex-col overflow-hidden",
          "motion-reduce:static! motion-reduce:h-auto!",
        )}
      >
        {/* Heading takes its natural height; the row area below gets
            whatever is left of the 100svh stage, so the two together never
            exceed one screen. */}
        <Container className="shrink-0 pb-6 pt-10 lg:pb-8 lg:pt-14">
          {heading}
        </Container>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            "motion-reduce:h-[65vh]! motion-reduce:flex-none! motion-reduce:overflow-x-auto! motion-reduce:overscroll-x-contain",
          )}
        >
          <div
            ref={rowRef}
            className="flex h-full w-max items-stretch gap-4 px-[5vw] will-change-transform motion-reduce:py-4 lg:gap-5"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SolutionCard({ solution }: { solution: Solution }) {
  const Icon = icons[solution.icon];

  return (
    <article
      className={cn(
        // `h-full` picks up whatever the row area currently allows: the
        // remaining space under the heading in the pinned stage, or the
        // fixed 65vh strip used for the prefers-reduced-motion fallback —
        // the card doesn't need to know which.
        "flex h-full shrink-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface-raised text-on-surface-raised",
        // Wide enough that the row still overhangs the viewport by a real
        // distance even once the shorter height narrows the row's total
        // content width along with it -- narrower cards here nearly
        // eliminate the horizontal scroll travel on common desktop widths,
        // which makes the pan too subtle to read as motion.
        "md:w-[46vw] lg:w-[34vw] xl:w-[28vw]",
      )}
    >
      <div className="relative min-h-0 w-full flex-1 overflow-hidden">
        <Image
          src={solution.image}
          alt=""
          fill
          sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 34vw, 46vw"
          className="object-cover"
        />
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 p-5 lg:p-6">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-full bg-muted text-on-surface-raised"
        >
          <Icon className="h-4.5 w-4.5" />
        </span>

        <div>
          <h3 className="text-base font-semibold tracking-tight lg:text-lg">
            {solution.name}
          </h3>
          <p className="text-sm font-medium text-secondary">
            {solution.subtitle}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-on-muted">
          {solution.description}
        </p>

        <Link
          href={solution.href}
          aria-label={`Talk to us about ${solution.name}`}
          className="mt-0.5 inline-flex h-9 w-9 items-center justify-center self-start rounded-full border border-border text-on-surface-raised transition-colors hover:border-secondary hover:text-secondary"
        >
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/** Mobile mosaic tile: photo, dark tint, label sitting on the tint. */
function SolutionTile({ solution }: { solution: Solution }) {
  return (
    <Link
      href={solution.href}
      aria-label={`Talk to us about ${solution.name}`}
      className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
    >
      <Image
        src={solution.image}
        alt=""
        fill
        sizes="50vw"
        className="object-cover transition-transform duration-300 group-active:scale-105"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-overlay/90 via-overlay/20 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-overlay/75">
          {solution.subtitle}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-on-overlay">
          {solution.name}
        </p>
      </div>
    </Link>
  );
}

const icons = {
  truck: TruckIcon,
  boxes: BoxesIcon,
  bolt: BoltIcon,
  warehouse: WarehouseIcon,
} satisfies Record<Solution["icon"], (props: { className?: string }) => React.ReactElement>;

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M2 6h11v10H2z" />
      <path d="M13 10h4l4 3v3h-8z" />
      <circle cx="6.5" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </svg>
  );
}

function BoxesIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 8.5 8 6l5 2.5-5 2.5-5-2.5Z" />
      <path d="M3 8.5v7L8 18l5-2.5v-7" />
      <path d="M13 8.5 16 7l5 2.5-5 2.5-3-1.5" />
      <path d="M21 9.5V16l-5 2.5v-6.5" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function WarehouseIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 21V10l9-6 9 6v11" />
      <path d="M7 21v-7h10v7" />
      <path d="M3 10h18" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}
