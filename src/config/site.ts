/**
 * ============================================================================
 * SITE CONFIGURATION — edit this file, not the components.
 * ============================================================================
 * Everything that a marketing or content person is likely to change lives here:
 * the brand name, the logo, the navbar tabs, the call-to-action, contact
 * details and the SEO defaults.
 *
 * Adding a navbar tab = add one entry to `navigation` AND create the matching
 * route folder under `src/app/<slug>/page.tsx`. The navbar, the mobile menu,
 * the footer and `sitemap.ts` all read from this single list.
 */

import { getSiteUrl } from "@/lib/site-url";

export type NavItem = {
  /** Text shown in the navbar. */
  label: string;
  /** Route this tab navigates to. Must match a folder in `src/app`. */
  href: string;
  /** Screen-reader / SEO description of the destination. */
  description?: string;
};

export const siteConfig = {
  /** Legal / full company name. Used in structured data and the footer. */
  name: "DOT Logistics",
  /** Short name used in the wordmark and the browser title template. */
  shortName: "DOT",
  /** One-line positioning statement. Feeds the default meta description. */
  tagline: "Freight forwarding, warehousing and last-mile delivery",
  description:
    "DOT Logistics moves freight across road, rail, air and sea with real-time tracking, bonded warehousing and customs clearance handled end to end.",

  /**
   * Brand strapline, split so the second half can carry DOT Yellow exactly as
   * it does in the logo lockup. Rendered uppercase by the component.
   */
  strapline: {
    lead: "One dot. Many",
    highlight: "possibilities.",
  },

  /**
   * Canonical origin, no trailing slash. Drives canonical URLs, Open Graph
   * URLs, the sitemap and robots.txt. Override per-environment with
   * NEXT_PUBLIC_SITE_URL (see `.env.example`). Resolution — including the
   * dev/production/Vercel-preview fallbacks and validation that guards
   * against a set-but-blank environment variable — lives in one place:
   * `src/lib/site-url.ts`. Don't read `process.env.NEXT_PUBLIC_SITE_URL`
   * anywhere else; go through `siteConfig.url`.
   */
  url: getSiteUrl(),

  locale: "en_US",
  /** BCP-47 tag written to <html lang>. */
  lang: "en",

  /**
   * Social sharing image. Drop a 1200x630 PNG at `public/og-image.png`
   * (or point this at any absolute/relative path you prefer).
   */
  ogImage: "/og-image.png",

  /**
   * LOGO SLOT
   * ---------
   * Leave `src` as `null` to use the built-in inline SVG mark + wordmark
   * (see `src/components/layout/Logo.tsx`).
   * To use a real logo file: drop it in `public/` and set
   *   src: "/logo.svg", width: 160, height: 32
   */
  logo: {
    src: null as string | null,
    alt: "DOT Logistics",
    width: 160,
    height: 32,
  },

  /**
   * NAVBAR TABS — order here is the order on screen.
   * Each one is a separate page (not an on-page anchor).
   */
  navigation: [
    { label: "Home", href: "/", description: "Company overview and services" },
    {
      label: "Technology",
      href: "/technology",
      description: "Our logistics platform, APIs and integrations",
    },
    {
      label: "Tracking",
      href: "/tracking",
      description: "Track a shipment by reference number",
    },
    {
      label: "Careers",
      href: "/careers",
      description: "Open roles and life at the company",
    },
    {
      label: "Contact",
      href: "/contact",
      description: "Talk to sales, support or operations",
    },
  ] satisfies NavItem[],

  /** Primary button pinned to the right of the navbar. */
  navCta: {
    label: "Request a quote",
    href: "/contact",
  },

  /**
   * Soft-launch switch. While true, every page except Home ("/") shows a
   * basic "Coming soon" placeholder (see `ComingSoon.tsx`, structured like
   * the Hero) instead of its real content — visiting the page's own URL
   * directly shows the placeholder too, not just the nav link. Each real
   * page's actual content is untouched in its file, just gated behind this
   * flag, so flipping it to `false` brings the whole site live at once with
   * no content to restore or rewrite.
   */
  comingSoon: true,

  /**
   * The ONE place a colour literal is allowed outside `globals.css`.
   * `<meta name="theme-color">` paints the mobile browser chrome and is read
   * by the browser before any CSS loads, so it cannot reference a CSS token.
   * This is DOT White — keep it in sync with `--background` in `globals.css`.
   */
  browserThemeColor: "#ffffff",

  contact: {
    email: "info@thisisdot.in",
    supportEmail: "support@thisisdot.in",
    phone: "+91 95609 20069",
    /** E.164, used in `tel:` links and structured data. */
    phoneHref: "+919560920069",
    /** Shown as plain text (e.g. in the footer); not necessarily the same
     *  origin as `siteConfig.url`, which drives canonical/OG/sitemap URLs. */
    website: "www.thisisdot.in",
    address: {
      street: "54, Huda Complex, Sector 29",
      locality: "Faridabad",
      region: "Haryana",
      postalCode: "121008",
      country: "IN",
    },
    hours: "Mon-Sat, 09:00-19:00 IST",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/example",
    x: "https://x.com/example",
    youtube: "https://www.youtube.com/@example",
  },

  /** @handle used for Twitter/X card attribution. */
  twitterHandle: "@dotlogistics",

  /**
   * HERO BACKGROUND VIDEO
   * ---------------------
   * Left empty on purpose. Drop an MP4 in `public/` and set `videoSrc` to it —
   * the hero switches from the static layout to the scroll-scrubbed version
   * automatically. See `src/components/media/ScrollVideo.tsx`.
   */
  hero: {
    videoSrc: null as string | null,
    posterSrc: null as string | null,
    /** How many viewport heights of scroll the video playback is spread over. */
    scrollLengthVh: 300,
  },
} as const;

export type SiteConfig = typeof siteConfig;
