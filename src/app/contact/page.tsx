import { ComingSoon } from "@/components/sections/ComingSoon";
import { ContactForm } from "@/components/sections/ContactForm";
import { PageHeader } from "@/components/sections/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { comingSoonMetadata, createMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

const description =
  "Talk to our sales, support or operations teams about freight quotes, existing shipments or partnership enquiries.";

export const metadata = siteConfig.comingSoon
  ? comingSoonMetadata("Contact", "/contact")
  : createMetadata({
      title: "Contact",
      description,
      path: "/contact",
      keywords: ["contact logistics company", "freight quote", "shipping support"],
    });

const routes = [
  {
    title: "New business",
    body: "Quotes, lane pricing and tenders.",
    href: "mailto:" + siteConfig.contact.email,
    value: siteConfig.contact.email,
  },
  {
    title: "Shipment support",
    body: "Existing bookings, exceptions and documentation.",
    href: "mailto:" + siteConfig.contact.supportEmail,
    value: siteConfig.contact.supportEmail,
  },
  {
    title: "Control tower",
    body: "Urgent operational issues, 24/7.",
    href: "tel:" + siteConfig.contact.phoneHref,
    value: siteConfig.contact.phone,
  },
];

export default function ContactPage() {
  if (siteConfig.comingSoon) {
    return <ComingSoon pageName="Contact" />;
  }

  const { address } = siteConfig.contact;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <PageHeader
        eyebrow="Contact"
        title="Tell us what you need moved"
        description={description}
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {routes.map((route) => (
            <Card key={route.title} className="hover:border-secondary">
              <CardTitle>{route.title}</CardTitle>
              <CardBody>{route.body}</CardBody>
              <a
                href={route.href}
                className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {route.value}
              </a>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Send a message"
              title="We reply within one business day"
              description="The more detail on origin, destination, volume and timing, the more useful our first answer will be."
            />

            <div className="mt-10 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Head office
                </h3>
                <address className="mt-3 text-sm not-italic leading-relaxed text-on-muted">
                  {address.street}
                  <br />
                  {address.locality}, {address.region} {address.postalCode}
                  <br />
                  {address.country}
                </address>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
                  Office hours
                </h3>
                <p className="mt-3 text-sm text-on-muted">
                  {siteConfig.contact.hours}
                  <br />
                  Control tower operates 24/7 for live shipments.
                </p>
              </div>

              <div
                aria-hidden="true"
                className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-sm text-on-muted"
              >
                Map embed slot
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}
