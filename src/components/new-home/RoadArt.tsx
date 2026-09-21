/**
 * Inline line art for the /new-home sequence. All stroke, no fill, all
 * `currentColor` — so each one takes its colour from whatever it sits in and
 * stays crisp at any size without shipping an image.
 */

function strokeProps(className?: string, width = 1.5) {
  return {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

/** Side-view outline truck, facing right. Drives along the intro panel's floor. */
export function LineTruck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 108 46" {...strokeProps(className)}>
      {/* Trailer */}
      <rect x="2" y="6" width="68" height="25" rx="2" />
      {/* Cab: bonnet, sloped windscreen, roof */}
      <path d="M72 31V15h8l6-7h9a3 3 0 0 1 3 3v20Z" />
      {/* Chassis line between the two */}
      <path d="M70 27h2" />
      {/* Wheels */}
      <circle cx="18" cy="35" r="4.5" />
      <circle cx="31" cy="35" r="4.5" />
      <circle cx="78" cy="35" r="4.5" />
      <circle cx="92" cy="35" r="4.5" />
    </svg>
  );
}

/** Traffic cone seen from above: square base, cone rings stacked in the middle. */
export function TrafficCone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" {...strokeProps(className, 2)}>
      <rect x="5" y="5" width="30" height="30" rx="6" />
      <circle cx="20" cy="20" r="9.5" />
      <circle cx="20" cy="20" r="4.5" />
    </svg>
  );
}

/** Road barrier seen from above: hatched beam on two feet. */
export function Barrier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 30" {...strokeProps(className, 2)}>
      <rect x="3" y="8" width="114" height="14" rx="3" />
      <path d="M16 22 28 8M34 22 46 8M52 22 64 8M70 22 82 8M88 22 100 8" />
      <path d="M9 22v5M111 22v5" />
    </svg>
  );
}

/** The intro's scroll prompt. */
export function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps(className, 2)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
