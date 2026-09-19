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
  name: "Meridian Logistics",
  /** Short name used in the wordmark and the browser title template. */
  shortName: "Meridian",
  /** One-line positioning statement. Feeds the default meta description. */
  tagline: "Freight forwarding, warehousing and last-mile delivery",
  description:
    "Meridian Logistics moves freight across road, rail, air and sea with real-time tracking, bonded warehousing and customs clearance handled end to end.",

  /**
   * Canonical origin, no trailing slash. Drives canonical URLs, Open Graph
   * URLs, the sitemap and robots.txt. Override per-environment with
   * NEXT_PUBLIC_SITE_URL (see `.env.example`).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.meridian-logistics.com",

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
    alt: "Meridian Logistics",
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
   * The ONE place a colour literal is allowed outside `globals.css`.
   * `<meta name="theme-color">` paints the mobile browser chrome and is read
   * by the browser before any CSS loads, so it cannot reference a CSS token.
   * This is DOT White — keep it in sync with `--background` in `globals.css`.
   */
  browserThemeColor: "#ffffff",

  contact: {
    email: "hello@meridian-logistics.com",
    supportEmail: "support@meridian-logistics.com",
    phone: "+1 (555) 014-2200",
    /** E.164, used in `tel:` links and structured data. */
    phoneHref: "+15550142200",
    address: {
      street: "1400 Harbour Gateway",
      locality: "Newark",
      region: "NJ",
      postalCode: "07114",
      country: "US",
    },
    hours: "Mon-Fri, 07:00-19:00 ET",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/example",
    x: "https://x.com/example",
    youtube: "https://www.youtube.com/@example",
  },

  /** @handle used for Twitter/X card attribution. */
  twitterHandle: "@example",

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
