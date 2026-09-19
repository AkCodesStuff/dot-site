import Image from "next/image";
import type { ReactNode } from "react";

import { ScrollVideo } from "@/components/media/ScrollVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * HERO
 * ============================================================================
 * Two modes, chosen automatically:
 *
 *   siteConfig.hero.videoSrc === null   ->  light hero (what you see today)
 *   siteConfig.hero.videoSrc === "..."  ->  scroll-scrubbed video background
 *
 * The copy and layout are identical in both modes; only the colour treatment
 * swaps, because the video sits under a DOT Black scrim and needs inverted
 * text. Dropping the video in later is a one-line config change.
 *
 * The static (non-video) backdrop is a sky photo with a truck cut-out layered
 * on top. Both are `fill` images sized off the viewport with `sizes`, so they
 * scale continuously rather than jumping at a couple of fixed breakpoints —
 * see the two <Image> blocks below for the responsive sizing.
 */
export function Hero({
  lockup,
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  children,
}: {
  /** Optional brand lockup rendered above the eyebrow. */
  lockup?: ReactNode;
  /** Small kicker above the headline. Omit when the lockup already says it. */
  eyebrow?: string;
  title: ReactNode;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Anything to sit under the buttons — a note, a form, status chips. */
  children?: ReactNode;
}) {
  const overVideo = Boolean(siteConfig.hero.videoSrc);

  const content = (
    <Container className="relative z-10">
      <div className="max-w-3xl py-24 sm:py-28 lg:py-32">
        {lockup ? <div className="mb-8 sm:mb-10">{lockup}</div> : null}

        {eyebrow ? (
          <p
            className={cn(
              "mb-4 text-sm font-semibold uppercase tracking-[0.2em]",
              overVideo ? "text-accent" : "text-secondary",
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "text-balance uppercase font-black leading-[0.95] tracking-tight",
            "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
          )}
        >
          {title}
        </h1>

        <p
          className={cn(
            "mt-6 max-w-xl text-lg font-medium leading-relaxed text-pretty sm:text-xl lg:text-2xl",
            overVideo ? "text-on-overlay/80" : "text-secondary",
          )}
        >
          {description}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href={primaryCta.href} variant="accent" size="lg">
            {primaryCta.label}
          </ButtonLink>
          {secondaryCta ? (
            <ButtonLink
              href={secondaryCta.href}
              variant={overVideo ? "onOverlay" : "outline"}
              size="lg"
            >
              {secondaryCta.label}
            </ButtonLink>
          ) : null}
        </div>

        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </Container>
  );

  if (siteConfig.hero.videoSrc) {
    return (
      <section className="text-on-overlay">
        <ScrollVideo
          src={siteConfig.hero.videoSrc}
          poster={siteConfig.hero.posterSrc}
          heightVh={siteConfig.hero.scrollLengthVh}
        >
          {content}
        </ScrollVideo>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-svh flex-col justify-center overflow-hidden border-b border-border bg-surface text-on-surface">
      {/* Backdrop photo — a road and sky scene, replaced by the video once it
          is configured. `fill` + `sizes="100vw"` lets it scale continuously
          with the viewport instead of snapping between fixed sizes. */}
      <Image
        src="https://res.cloudinary.com/js6wkdfq/image/upload/v1789797950/bg-dot.png"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
        priority
      />

      {/* Truck cut-out. Sized as a share of the viewport with a cap, so it
          scales down smoothly on narrow screens instead of overflowing or
          overlapping the copy, and never grows past a sensible size on very
          wide ones. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute bottom-0 right-2 aspect-[4/3] w-[46vw] max-w-[420px] sm:right-8 sm:w-[36vw]",
          "md:w-[30vw] lg:right-16 lg:w-[24vw]",
          "transition-transform duration-300 lg:hover:-translate-y-4",
        )}
      >
        <Image
          src="https://res.cloudinary.com/js6wkdfq/image/upload/e_background_removal/v1789797069/truck-dot-2.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 36vw, 46vw"
          className="pointer-events-none object-contain object-bottom"
          priority
        />
      </div>

      {/* A soft DOT Yellow wash bleeding in from the top-right corner, at low
          opacity so it stays a tint of the signature colour rather than a
          new one. Hidden below `lg` where there is no room to spare. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 hidden h-[36rem] w-[36rem] rounded-full bg-accent/15 blur-3xl lg:block"
      />

      {content}
    </section>
  );
}
