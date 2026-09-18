import type { ReactNode } from "react";

import { ScrollVideo } from "@/components/media/ScrollVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

/**
 * ============================================================================
 * HERO
 * ============================================================================
 * Two modes, chosen automatically:
 *
 *   siteConfig.hero.videoSrc === null  ->  static hero (what you see today)
 *   siteConfig.hero.videoSrc === "..."  ->  scroll-scrubbed video background
 *
 * The overlay copy is identical in both modes, so dropping the video in later
 * is a one-line config change — no markup rewrite.
 */
export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  const content = (
    <Container>
      <div className="max-w-3xl py-20 sm:py-28">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty opacity-80">
          {description}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink
            href={primaryCta.href}
            variant="accent"
            size="lg"
          >
            {primaryCta.label}
          </ButtonLink>
          {secondaryCta ? (
            <ButtonLink
              href={secondaryCta.href}
              variant="onOverlay"
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
    <section className="relative overflow-hidden bg-overlay text-on-overlay">
      {/* Placeholder backdrop — replaced by the video once it is configured. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary via-overlay to-secondary opacity-90"
      />
      <div className="relative">{content}</div>
    </section>
  );
}
