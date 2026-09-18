import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
};

export function Footer() {
  const year = new Date().getFullYear();
  const { address } = siteConfig.contact;

  return (
    <footer className="border-t border-border bg-primary text-on-primary">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-on-primary" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-primary/75">
              {siteConfig.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-4">
              {Object.entries(siteConfig.social).map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm font-medium text-on-primary/75 underline-offset-4 transition-colors hover:text-accent hover:underline"
                  >
                    {socialLabels[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Pages
            </h2>
            <ul className="mt-4 space-y-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-on-primary/75 underline-offset-4 transition-colors hover:text-on-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Get in touch
            </h2>
            <address className="mt-4 space-y-3 text-sm not-italic text-on-primary/75">
              <p>
                {address.street}
                <br />
                {address.locality}, {address.region} {address.postalCode}
                <br />
                {address.country}
              </p>
              <p>
                <a
                  href={`tel:${siteConfig.contact.phoneHref}`}
                  className="underline-offset-4 transition-colors hover:text-on-primary hover:underline"
                >
                  {siteConfig.contact.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="underline-offset-4 transition-colors hover:text-on-primary hover:underline"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
              <p>{siteConfig.contact.hours}</p>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-on-primary/15 pt-6 text-sm text-on-primary/60">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
