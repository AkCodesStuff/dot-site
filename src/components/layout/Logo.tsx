import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * LOGO SLOT
 * ============================================================================
 * Two ways to use this:
 *
 * 1. Image file (recommended for a real brand)
 *    - drop `logo.svg` (or .png) into `public/`
 *    - in `src/config/site.ts` set:  logo: { src: "/logo.svg", ... }
 *
 * 2. Built-in mark (the default)
 *    - an inline SVG that inherits `currentColor`, so it re-colours itself on
 *      light headers, dark footers and over the hero video with no extra CSS.
 *    - swap the <path> below for your own mark and it keeps working.
 */
export function Logo({
  className,
  /** Hide the wordmark and show only the mark (useful in tight footers). */
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
        "inline-flex items-center gap-2.5 rounded-md font-semibold tracking-tight",
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
          {!markOnly ? (
            <span className="text-lg leading-none">
              {siteConfig.shortName}
              <span className="text-accent">.</span>
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
}

/** The bare mark. `currentColor` keeps it token-driven — no hard-coded fills. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M8 21.5 13.2 10.5l4.1 7.6 2.3-3.9L24 21.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
