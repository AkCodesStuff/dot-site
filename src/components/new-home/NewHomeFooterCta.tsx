import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

/** Placeholder sign-off for the new landing page. Real footer comes later. */
export function NewHomeFooterCta() {
  const { phone, phoneHref, email, address, hours } = siteConfig.contact;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-on-primary">
      <Container className="flex flex-col gap-10 py-16 lg:flex-row lg:items-end lg:justify-between lg:py-24">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-4xl">
            Got freight that needs{" "}
            <span className="text-accent">moving?</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-on-primary/70">
            Tell us the lane and the load. We&rsquo;ll come back with capacity
            and a price.
          </p>
        </div>

        <div className="flex flex-col items-start gap-5">
          <ButtonLink href="/contact" variant="accent" size="lg">
            Talk to us
          </ButtonLink>
          <div className="font-ui text-sm text-on-primary/70">
            <a
              href={`tel:${phoneHref}`}
              className="underline-offset-4 hover:text-on-primary hover:underline"
            >
              {phone}
            </a>
            <span className="px-2 text-on-primary/30">/</span>
            <a
              href={`mailto:${email}`}
              className="underline-offset-4 hover:text-on-primary hover:underline"
            >
              {email}
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-on-primary/15">
        <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-on-primary/50">
              Corporate office
            </p>
            <p className="mt-4 text-sm leading-relaxed text-on-primary/70">
              {address.street}
              <br />
              {address.locality}, {address.region} — {address.postalCode}
            </p>
          </div>

          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-on-primary/50">
              Get in touch
            </p>
            <ul className="mt-4 space-y-2 text-sm text-on-primary/70">
              <li>
                <a
                  href={`tel:${phoneHref}`}
                  className="underline-offset-4 hover:text-on-primary hover:underline"
                >
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="underline-offset-4 hover:text-on-primary hover:underline"
                >
                  {email}
                </a>
              </li>
              <li>{hours}</li>
            </ul>
          </div>

          <nav aria-label="Footer">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-on-primary/50">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-on-primary/70 underline-offset-4 hover:text-on-primary hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <div className="border-t border-on-primary/15">
        <Container className="py-6">
          <p className="text-sm text-on-primary/50">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
