import {
  BAND_CLIP_PATH,
  BAND_HEIGHT_VH,
} from "@/components/new-home/config";
import { cn } from "@/lib/utils";

/** Placeholder line-up — swap the copy once the real service set is settled. */
export const SERVICES = [
  {
    icon: "truck" as const,
    name: "Full truckload",
    body: "One consignment, one trailer, straight through.",
  },
  {
    icon: "route" as const,
    name: "Long-haul lanes",
    body: "Scheduled trunk routes between metros, run to a timetable.",
  },
  {
    icon: "clock" as const,
    name: "Time-definite",
    body: "Committed delivery windows, not best-effort estimates.",
  },
  {
    icon: "pin" as const,
    name: "Live tracking",
    body: "Position and ETA on every load, without a phone call.",
  },
];

type Service = (typeof SERVICES)[number];

/**
 * ============================================================================
 * SERVICES BAND
 * ============================================================================
 * The dark panel that rises over the pinned truck stage, plays its service
 * frames, then lifts away. Markup only — `TruckSequence` owns the one timeline
 * that drives it, targeting `[data-band]` and `[data-card="n"]`.
 *
 * The band is taller than the stage so that both slanted edges sit outside the
 * viewport while it covers (see `BAND_HEIGHT_VH`), which is what makes the
 * slant visible only on the way in and the way out. Because it is centred over
 * the stage at rest, a card centred in the band is centred on screen.
 *
 * Every card renders at every breakpoint; only their grouping into frames
 * changes, and that is done in the timeline. Which half of the screen a card
 * occupies on a wide layout is pure CSS on the slot wrapper, so GSAP is never
 * fighting a Tailwind transform for the same element.
 */
export function ServicesBand() {
  return (
    <div
      data-band
      // `invisible` covers the gap before the timeline parks this below the
      // stage — without it the server-rendered markup shows a full-screen
      // panel sitting over the hero until hydration. It must not be a
      // `translate-*` class: Tailwind v4 writes those to the `translate`
      // property, which composes with (rather than being replaced by) the
      // `transform` GSAP writes, and the band would end up double-offset.
      className="invisible absolute inset-x-0 top-0 z-30 bg-secondary text-on-secondary"
      style={{ height: `${BAND_HEIGHT_VH}vh`, clipPath: BAND_CLIP_PATH }}
    >
      <p className="absolute inset-x-0 top-1/2 translate-y-[-38vh] text-center font-ui text-xs font-semibold uppercase tracking-[0.2em] text-on-secondary/50">
        What we run
      </p>

      {SERVICES.map((service, index) => (
        <div
          key={service.name}
          className={cn(
            "absolute inset-y-0 left-0 right-0 flex items-center justify-center px-5",
            // Wide layout pairs the cards up, so even indices take the left
            // half of the stage and odd indices the right.
            index % 2 === 0
              ? "lg:right-1/2 lg:justify-end lg:pr-4"
              : "lg:left-1/2 lg:justify-start lg:pl-4",
          )}
        >
          <div
            data-card={index}
            className="invisible w-full max-w-md opacity-0 lg:max-w-sm"
          >
            <ServiceCard index={index} service={service} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ index, service }: { index: number; service: Service }) {
  return (
    <article className="rounded-2xl border border-on-secondary/20 bg-on-secondary/5 p-7 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-ui text-sm font-bold tracking-[0.2em] text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ServiceIcon name={service.icon} className="h-8 w-8 text-accent" />
      </div>
      <h3 className="mt-7 text-2xl font-bold tracking-tight sm:text-3xl">
        {service.name}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-on-secondary/70 sm:text-base">
        {service.body}
      </p>
    </article>
  );
}

/** The same four services as a plain list, for the reduced-motion layout. */
export function ServicesList() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {SERVICES.map((service, index) => (
        <li
          key={service.name}
          className="rounded-2xl border border-border bg-surface-raised p-6 text-on-surface-raised"
        >
          <div className="flex items-center justify-between">
            <span className="font-ui text-sm font-bold tracking-[0.2em] text-secondary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <ServiceIcon name={service.icon} className="h-7 w-7 text-accent" />
          </div>
          <h3 className="mt-5 text-lg font-semibold tracking-tight">
            {service.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-on-muted">
            {service.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ServiceIcon({
  name,
  className,
}: {
  name: Service["icon"];
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
    case "truck":
      return (
        <svg {...props}>
          <path d="M2.5 6.5h10v9h-10z" />
          <path d="M12.5 10h4l4.5 2.5v3h-8.5z" />
          <circle cx="6.5" cy="17.5" r="1.6" />
          <circle cx="17" cy="17.5" r="1.6" />
        </svg>
      );
    case "route":
      return (
        <svg {...props}>
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="5.5" r="2.5" />
          <path d="M8 18.5h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5.2l3.4 2" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
  }
}
