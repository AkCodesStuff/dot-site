import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

/** Placeholder sign-off for the new landing page. Real footer comes later. */
export function NewHomeFooterCta() {
  const { phone, phoneHref, email } = siteConfig.contact;

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
    </footer>
  );
}
