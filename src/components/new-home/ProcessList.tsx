import { cn } from "@/lib/utils";

/** The movement lifecycle, start to finish. */
const PROCESS = [
  {
    icon: "doc" as const,
    name: "Booking",
    body: "Customer requirement received and movement created.",
  },
  {
    icon: "calendar" as const,
    name: "Planning",
    body: "Route, vehicle and operational requirements planned.",
  },
  {
    icon: "truck" as const,
    name: "Vehicle placement",
    body: "The right vehicle and driver configuration is deployed.",
  },
  {
    icon: "pin" as const,
    name: "Tracking",
    body: "Movement monitored through real-time visibility and operational controls.",
  },
  {
    icon: "box" as const,
    name: "Delivery",
    body: "Goods delivered with proof of completion.",
  },
  {
    icon: "invoice" as const,
    name: "Billing",
    body: "Movement translated into accurate, timely billing.",
  },
  {
    icon: "chart" as const,
    name: "Analytics",
    body: "Trip, fleet and financial data converted into actionable insights.",
  },
];

const FOOTER = "One connected workflow. Complete movement visibility.";

type Step = (typeof PROCESS)[number];

/**
 * ============================================================================
 * PROCESS LIST
 * ============================================================================
 * The seven-step workflow, shown down the right of the night stage while the
 * truck holds the far left. Markup only — `TruckSequence` owns the timeline
 * and animates `[data-process]`, one row at a time.
 *
 * Built for a dark surface: every colour is an `on-primary` tint, so it reads
 * on the blacked-out stage and in the reduced-motion night section alike.
 *
 * The rail through the dots is per-row rather than one long line — each row's
 * segment spans its own full height (`self-stretch`) and the rows sit flush
 * against each other, so the segments meet and read as continuous.
 *
 * Title and description only sit side by side from `lg`. Below that there is
 * not enough width beside the truck, and forcing it there turns a 72-character
 * description into six lines and the list into something taller than the stage.
 */
export function ProcessList({ animated = false }: { animated?: boolean }) {
  return (
    <>
      {/* Below `md` the list gives way to the wheel. Only one of the two is
          ever displayed, so neither is announced twice. The wheel needs the
          timeline to place it, so the static layout keeps the list at every
          width instead. */}
      {animated ? <ProcessWheel /> : null}

      <div className={animated ? "hidden h-full md:block" : undefined}>
        <ol>
        {PROCESS.map((step, index) => (
          <li
            key={step.name}
            data-process={animated ? "" : undefined}
            className={cn(
              "flex items-center gap-3 border-t border-on-primary/10 py-3 first:border-t-0 md:gap-4 md:py-3.5",
              animated && "invisible opacity-0",
            )}
          >
            <span className="font-ui text-xs font-semibold tabular-nums text-on-primary/40 md:text-sm">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span
              aria-hidden="true"
              className="relative flex w-3 shrink-0 justify-center self-stretch"
            >
              <span className="absolute inset-y-0 w-px bg-on-primary/15" />
              <span className="relative my-auto h-2 w-2 rounded-full bg-accent" />
            </span>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-on-primary/10 md:h-10 md:w-10">
              <ProcessIcon
                name={step.icon}
                className="h-4 w-4 text-on-primary md:h-5 md:w-5"
              />
            </span>

            <div className="min-w-0 flex-1 lg:flex lg:items-baseline lg:gap-5">
              <h3 className="font-ui text-xs font-bold uppercase tracking-[0.12em] md:text-sm lg:w-[15ch] lg:shrink-0">
                {step.name}
              </h3>
              <p className="mt-0.5 text-xs leading-snug text-on-primary/60 md:text-sm lg:mt-0">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p
        data-process={animated ? "" : undefined}
        className={cn(
          "mt-5 text-center font-ui text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-on-primary/45 md:text-xs",
          animated && "invisible opacity-0",
        )}
      >
          {FOOTER}
        </p>
      </div>
    </>
  );
}

/**
 * The phone layout: the same seven steps on a semicircle whose centre sits on
 * the right edge of this box, so the arc closes on itself there and bulges
 * left into the screen.
 *
 * Every item is parked at the box's left edge and vertical middle; the
 * timeline places each one on the arc with `x`, `y`, `scale` and `opacity`,
 * recomputed as the wheel turns. Nothing here is rotated, so the labels stay
 * upright all the way round.
 */
function ProcessWheel() {
  return (
    <div
      data-wheel
      className="invisible relative h-full overflow-hidden opacity-0 md:hidden"
    >
      {PROCESS.map((step, index) => (
        <div
          key={step.name}
          data-wheel-item
          className="absolute left-0 top-1/2 flex items-center gap-2.5 whitespace-nowrap"
        >
          <span className="font-ui text-[0.65rem] font-semibold tabular-nums text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
          />
          <span className="font-ui text-sm font-bold uppercase tracking-[0.12em] text-on-primary">
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProcessIcon({
  name,
  className,
}: {
  name: Step["icon"];
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
    case "doc":
      return (
        <svg {...props}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <path d="M2.5 6.5h10v9h-10z" />
          <path d="M12.5 10h4l4.5 2.5v3h-8.5z" />
          <circle cx="6.5" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
    case "box":
      return (
        <svg {...props}>
          <path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9z" />
          <path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9" />
        </svg>
      );
    case "invoice":
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
          <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M4 20h16" />
          <path d="M7 20v-6M12 20V7M17 20v-9" />
        </svg>
      );
  }
}
