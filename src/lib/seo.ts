import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

export type PageSeo = {
  /** Page title without the brand suffix — the template adds it. */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/careers". Used for the canonical URL. */
  path: string;
  /** Overrides the default social image for this page. */
  ogImage?: string;
  /** Set true for pages that should stay out of search results. */
  noIndex?: boolean;
  /** "website" for marketing pages, "article" for blog/news posts. */
  type?: "website" | "article";
  keywords?: string[];
};

/**
 * Builds a complete, consistent `Metadata` object for a page.
 *
 * Every page under `src/app` should export:
 *   export const metadata = createMetadata({ title, description, path });
 *
 * Canonical URL, Open Graph, Twitter card and robots directives are all
 * derived from that one call so no page can drift out of sync.
 */
export function createMetadata({
  title,
  description,
  path,
  ogImage = siteConfig.ogImage,
  noIndex = false,
  type = "website",
  keywords,
}: PageSeo): Metadata {
  const url = absoluteUrl(path, siteConfig.url);
  const image = absoluteUrl(ogImage, siteConfig.url);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title: `${title} | ${siteConfig.shortName}`,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.shortName}`,
      description,
      images: [image],
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
