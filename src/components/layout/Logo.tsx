import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * DOT LOGO
 * ============================================================================
 * The mark is a heavy `D` with the signature DOT Yellow dot seated in its
 * counter, overlapping the stem — drawn as vector, not an image file, so it
 * stays crisp and recolours itself from the theme tokens:
 *
 *   - the `D` is `currentColor`, so it is black on light headers and white
 *     over the hero video scrim, with no extra CSS
 *   - the dot is `fill-accent`, so it always carries DOT Yellow
 *
 * Swap in a real file instead by dropping it in `public/` and setting
 * `logo.src` in `src/config/site.ts`.
 */
export function Logo({
  className,
  /** Hide the wordmark and show only the mark (useful in tight spaces). */
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md",
        className,
      )}
    >
      {siteConfig.logo.src ? (
        <Image
          src={siteConfig.logo.src}
          alt={siteConfig.logo.alt}
          width={siteConfig.logo.width}
          height={siteConfig.logo.height}
          priority
          className="h-8 w-auto"
        />
      ) : (
        <>
          <LogoMark className="h-8 w-8 shrink-0" />
          {!markOnly ? <Wordmark className="text-xl" /> : null}
        </>
      )}
    </Link>
  );
}

/**
 * The bare mark. The `D` inherits `currentColor`; the dot is always DOT Yellow.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
    >
      {/* Heavy D, counter punched out with the even-odd rule. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M5 5h15c9.389 0 17 6.716 17 15s-7.611 15-17 15H5V5Zm9 8v14h6c4.418 0 7.5-3.134 7.5-7s-3.082-7-7.5-7h-6Z"
      />
      {/* The dot, seated in the counter and breaking into the stem. */}
      <circle cx="18.4" cy="20" r="6.9" className="fill-accent" />
    </svg>
  );
}

/** The `DOT` wordmark. Heavy and tight, to sit against the mark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-extrabold uppercase leading-none tracking-tight",
        className,
      )}
    >
      {siteConfig.shortName}
    </span>
  );
}

/**
 * Mark + wordmark + strapline, stacked. The full brand lockup, for places with
 * room to breathe — the landing hero, a splash screen, an email header.
 */
export function LogoLockup({
  className,
  strapline = true,
}: {
  className?: string;
  strapline?: boolean;
}) {
  return (
    <div className={cn("inline-flex flex-col items-start gap-3", className)}>
      <div className="flex items-center gap-3">
        <Image
          src="https://res.cloudinary.com/js6wkdfq/image/upload/v1789822324/dot-logo-bg-2.png"
          alt={siteConfig.logo.alt}
      
          width={60}
          height={60}
          priority
        />
        <Wordmark className="text-5xl sm:text-6xl" />
      </div>

      {strapline ? (
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] sm:text-xs">
          {siteConfig.strapline.lead}{" "}
          <span className="text-accent">{siteConfig.strapline.highlight}</span>
        </p>
      ) : null}
    </div>
  );
}
