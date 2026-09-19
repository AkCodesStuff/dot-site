import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";

import "./globals.css";

/**
 * ============================================================================
 * TYPE SYSTEM
 * ============================================================================
 * Spec: headlines in Söhne Bold/Buch, body copy in Söhne Buch or Inter
 * Regular, numbers/data/UI in Inter.
 *
 * Söhne is a paid commercial typeface (Klim Type Foundry) — there is no free
 * or legal source to pull it from, unlike Inter (Google Fonts, SIL Open Font
 * License), so it can't be wired in here yet. Inter is fully live for body
 * copy and numbers/data/UI, exactly per spec (Inter is the spec's own listed
 * option for body, not a substitute). Headlines use Inter as a temporary
 * fallback until real Söhne files exist — every heading site-wide reads the
 * `--font-headline` token (see globals.css), so dropping Söhne in later is a
 * two-file change, not a hunt through every component.
 *
 * TO ADD REAL SÖHNE ONCE YOU HAVE A LICENCE + FONT FILES:
 *   1. Create src/fonts/sohne/ and drop in the .woff2 files, e.g.
 *      Sohne-Buch.woff2 (weight 400) and Sohne-Kraftig.woff2 (weight 700).
 *   2. Add, below, alongside `inter`:
 *        import localFont from "next/font/local";
 *        const sohne = localFont({
 *          variable: "--font-sohne",
 *          src: [
 *            { path: "../fonts/sohne/Sohne-Buch.woff2", weight: "400", style: "normal" },
 *            { path: "../fonts/sohne/Sohne-Kraftig.woff2", weight: "700", style: "normal" },
 *          ],
 *        });
 *      and add `${sohne.variable}` to the <html> className below.
 *   3. In globals.css, change `--font-headline` (and `--font-body`, if you
 *      want Söhne there too) to `var(--font-sohne), var(--font-inter), ...`.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Site-wide SEO defaults. Individual pages override title/description/canonical
 * through `createMetadata()` in `src/lib/seo.ts`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    locale: siteConfig.locale,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
  // Drop your search-console tokens in here when you verify the domain.
  // verification: { google: "...", other: { "msvalidate.01": "..." } },
};

export const viewport: Viewport = {
  themeColor: siteConfig.browserThemeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.lang}
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-on-background">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>

        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
