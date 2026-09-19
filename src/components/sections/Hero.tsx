import type { ReactNode } from "react";

import { ScrollVideo } from "@/components/media/ScrollVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import Image from "next/image";
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
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Anything to sit under the buttons — a note, a form, status chips. */
  children?: ReactNode;
}) {
  const overVideo = Boolean(siteConfig.hero.videoSrc);

  const content = (
    <Container>
      <div className="max-w-3xl py-20 sm:py-38">
       

        <p
          className={cn(
            "mb-4 text-sm font-semibold uppercase tracking-[0.2em]",
            overVideo ? "text-accent" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          We're <span className="text-accent">Building</span> the Next chapter of<span className="text-accent">  DOT</span>
        </h1>
        <p
          className={cn(
            "mt-6 max-w-2xl text-lg leading-relaxed text-pretty",
            overVideo ? "opacity-80" : "text-on-muted",
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
    <section className="relative h-screen overflow-hidden border-b border-border bg-surface text-on-surface">
      {/* Placeholder backdrop — replaced by the video once it is configured.
          A soft DOT Yellow wash bleeding in from the right, at low opacity so
          it stays a tint of the signature colour rather than a new one. */}
    

<div className="absolute w-full h-full bottom-0 right-0 flex justify-end items-end overflow-visible">
      <Image
        src="https://res.cloudinary.com/js6wkdfq/image/upload/v1789797950/bg-dot.png"
        alt=""
        fill
        className="pointer-events-none  inset-0 object-cover"
        priority
      />
      </div>
      <div className="absolute w-1/3 h-full bottom-0 right-20 hover:translate-y-20 pr-10 flex justify-end items-end overflow-visible">
      <Image
        src="https://res.cloudinary.com/js6wkdfq/image/upload/e_background_removal/v1789797069/truck-dot-2.png"
        alt=""
        height={300}
        width={400}
        className="pointer-events-none  inset-0 object-contain "
        priority
      />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24  hidden h-[36rem] w-[36rem] rounded-full bg-accent/15 blur-3xl lg:block"
      />
      <div className="relative">{content}</div>
    </section>
  );
}
