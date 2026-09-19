import { Hero } from "@/components/sections/Hero";

/**
 * The soft-launch placeholder shown instead of a page's real content while
 * `siteConfig.comingSoon` is on — see the pages under `src/app` (technology,
 * tracking, careers, contact) for where this is wired in, and the comment on
 * `siteConfig.comingSoon` for how to bring everything live again.
 *
 * Deliberately just the `Hero` component with placeholder copy: "the same
 * structure as the hero section" is literally this structure, not a lookalike
 * of it, and it keeps a page landing here consistent with the page that
 * isn't gated.
 */
export function ComingSoon({ pageName }: { pageName: string }) {
  return (
    <Hero
      eyebrow="Coming soon"
      title={
        <>
          {pageName} is <span className="text-accent">coming soon.</span>
        </>
      }
      description="We're still building this part of the site. Everything else is live and working."
      primaryCta={{ label: "Back to home", href: "/" }}
    />
  );
}
