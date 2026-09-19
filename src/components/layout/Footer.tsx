import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

/**
 * ============================================================================
 * FOOTER
 * ============================================================================
 * Two bands:
 *
 * - The photo band: the same background photo as the Hero, for continuity
 *   between the top and bottom of the page. Text sits directly on it in the
 *   site's ordinary light-theme colours (black headline, yellow accent, dark
 *   blue-grey labels) rather than white-on-a-dark-scrim, the same choice the
 *   Hero already makes — this photo's sky is naturally light, so it reads
 *   fine without inverting anything. A soft white glow sits behind the text
 *   as a legibility aid, the same trick already used in the Hero, not a new
 *   one invented here. No CTA in this band, by request.
 * - A slim black utility bar underneath: footer nav (still needed for
 *   internal linking and basic usability — this isn't in the reference, but
 *   dropping all site navigation from the footer isn't something "no CTA"
 *   asked for) and copyright.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const { address, phone, phoneHref, email, website } = siteConfig.contact;

  return (
    <footer className="border-t border-border">
      <div className="relative overflow-hidden bg-surface text-on-surface">
        <Image
          src="https://res.cloudinary.com/js6wkdfq/image/upload/v1789797950/bg-dot.png"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none object-cover object-top"
        />

        {/* Soft white glow behind the text for contrast against the photo —
            same technique as the Hero's spotlight, not a full dark scrim. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-1/2 h-[34rem] w-[44rem] -translate-y-1/2 rounded-full bg-background/70 blur-3xl"
        />

        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-lg">
            <h2 className="text-4xl font-black uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              India moves with <span className="text-accent">{siteConfig.shortName}.</span>
            </h2>
            <span
              aria-hidden="true"
              className="mt-5 block h-1 w-16 rounded-full bg-accent"
            />

            <div className="mt-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
                Corporate office
              </p>
              <ul className="mt-4 space-y-3.5">
                <li className="flex items-start gap-3">
                  <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm leading-relaxed sm:text-base">
                    {address.street}
                    <br />
                    {address.locality}, {address.region} — {address.postalCode}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 shrink-0 text-accent" />
                  <a
                    href={`tel:${phoneHref}`}
                    className="text-sm underline-offset-4 hover:underline sm:text-base"
                  >
                    {phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="h-5 w-5 shrink-0 text-accent" />
                  <a
                    href={`mailto:${email}`}
                    className="text-sm underline-offset-4 hover:underline sm:text-base"
                  >
                    {email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <GlobeIcon className="h-5 w-5 shrink-0 text-accent" />
                  <a
                    href={`https://${website}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm underline-offset-4 hover:underline sm:text-base"
                  >
                    {website}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      <div className="border-t border-border bg-primary text-on-primary">
        <Container className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-on-primary/70 underline-offset-4 transition-colors hover:text-on-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-on-primary/60">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6.5 3.5h2.8l1.4 4-2 1.5a12 12 0 0 0 5.3 5.3l1.5-2 4 1.4v2.8a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 5 5.1a1.5 1.5 0 0 1 1.5-1.6Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="m4 6.5 8 6.5 8-6.5" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.3 3.5 5.3 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.3-3.5-8.5S9.7 5.8 12 3.5Z" />
    </svg>
  );
}
