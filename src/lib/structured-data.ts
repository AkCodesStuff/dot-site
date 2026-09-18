import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

/**
 * JSON-LD builders. Rendered through `<JsonLd />`.
 *
 * Google reads these to build rich results — an Organization block gives you
 * the knowledge panel basics (logo, phone, socials), WebSite enables the
 * sitelinks search box, and BreadcrumbList renders the breadcrumb trail
 * under your result.
 */

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo.src ?? siteConfig.ogImage, siteConfig.url),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phoneHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address.street,
      addressLocality: siteConfig.contact.address.locality,
      addressRegion: siteConfig.contact.address.region,
      postalCode: siteConfig.contact.address.postalCode,
      addressCountry: siteConfig.contact.address.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: siteConfig.contact.phoneHref,
        email: siteConfig.contact.supportEmail,
        availableLanguage: ["English"],
      },
    ],
    sameAs: Object.values(siteConfig.social),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: siteConfig.lang,
  };
}

export function breadcrumbSchema(
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, siteConfig.url),
    })),
  };
}

/** Use on service/landing pages that describe a specific offering. */
export function serviceSchema(service: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path, siteConfig.url),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: "Worldwide",
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function jobPostingSchema(job: {
  title: string;
  description: string;
  employmentType: string;
  location: string;
  datePosted: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    employmentType: job.employmentType,
    datePosted: job.datePosted,
    hiringOrganization: { "@id": ORGANIZATION_ID },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: siteConfig.contact.address.country,
      },
    },
  };
}
