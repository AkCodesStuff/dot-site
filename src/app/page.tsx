import { LogoLockup } from "@/components/layout/Logo";
import { Hero } from "@/components/sections/Hero";
import { NotifyForm } from "@/components/sections/NotifyForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data";

const description =
  "DOT is upgrading. We're building the next chapter of DOT — a smarter, more connected logistics network for freight forwarding, warehousing and last-mile delivery. Bookings, tracking and support all continue as normal.";

export const metadata = createMetadata({
  title: "A smarter, more connected logistics network",
  description,
  path: "/",
  keywords: [
    "freight forwarding",
    "third party logistics",
    "supply chain management",
    "warehousing",
    "customs clearance",
  ],
});

/** Where the rollout is. Update the `state` as each phase lands. */
const phases = [
  { label: "Network mapped", state: "Done" as const },
  { label: "Platform rebuild", state: "In progress" as const },
  { label: "Customer rollout", state: "Next" as const },
];

const phaseTone = {
  Done: "success",
  "In progress": "warning",
  Next: "neutral",
} as const;

const whatsComing = [
  {
    name: "One connected network",
    description:
      "Road, rail, air, sea and warehousing on a single operating model, so a shipment never falls between two systems.",
  },
  {
    name: "Tracking that thinks ahead",
    description:
      "Carrier milestones, terminal dwell and lane history feed an ETA that updates itself, instead of a schedule that quietly goes stale.",
  },
  {
    name: "One platform, end to end",
    description:
      "Quote, book, track, clear customs and reconcile in the same place — no more stitching together carrier portals and spreadsheets.",
  },
  {
    name: "Onboarding in days",
    description:
      "Sandbox credentials on day one and a documented API, so your systems are talking to ours inside a fortnight.",
  },
];

const unaffected = [
  {
    title: "Track a shipment",
    body: "Live tracking is running exactly as it does today. Nothing has moved.",
    href: "/tracking",
    cta: "Open tracking",
  },
  {
    title: "Talk to the control tower",
    body: `Staffed 24/7 on ${siteConfig.contact.phone} for anything already in motion.`,
    href: "/contact",
    cta: "Contact us",
  },
  {
    title: "See the platform",
    body: "The technology behind the upgrade, including the API and integrations.",
    href: "/technology",
    cta: "Explore technology",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }]),
          serviceSchema({
            name: "Freight forwarding and supply chain logistics",
            description: siteConfig.description,
            path: "/",
          }),
        ]}
      />

      <Hero
        lockup={<LogoLockup />}
        eyebrow="We're upgrading"
        title={
          <>
            We&rsquo;re building the next chapter of{" "}
            <span className="whitespace-nowrap">
              {siteConfig.shortName}
              <span className="text-accent">.</span>
            </span>
          </>
        }
        description="A smarter, more connected logistics network — one operating model across road, rail, air and sea, with tracking and customs built into the same platform. Your freight keeps moving while we build it."
        primaryCta={{ label: "Track a shipment", href: "/tracking" }}
        secondaryCta={{ label: "Talk to us", href: "/contact" }}
      >
        <ul className="flex flex-wrap items-center gap-3">
          {phases.map((phase) => (
            <li key={phase.label} className="flex items-center gap-2">
              <Badge tone={phaseTone[phase.state]}>{phase.state}</Badge>
              <span className="text-sm font-medium">{phase.label}</span>
            </li>
          ))}
        </ul>
      </Hero>

      {/* --- What's coming -------------------------------------------------- */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="What's coming"
          title="Four things the upgrade changes"
          description="Not a new coat of paint. These are the parts of moving freight that are genuinely different once the rebuild lands."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {whatsComing.map((item) => (
            <Card key={item.name} className="hover:border-secondary">
              <CardTitle>{item.name}</CardTitle>
              <CardBody>{item.description}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* --- Business as usual ---------------------------------------------- */}
      <Section>
        <SectionHeading
          eyebrow="Meanwhile"
          title="Everything you use today still works"
          description="This is an upgrade, not an outage. Bookings, tracking, customs and support are unaffected while the new platform is built alongside them."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {unaffected.map((item) => (
            <div
              key={item.title}
              className="flex flex-col border-l-2 border-accent pl-5"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-on-muted">
                {item.body}
              </p>
              <ButtonLink
                href={item.href}
                variant="ghost"
                size="sm"
                className="mt-4 self-start px-0 hover:bg-transparent hover:text-secondary"
              >
                {item.cta} &rarr;
              </ButtonLink>
            </div>
          ))}
        </div>
      </Section>

      {/* --- Notify ---------------------------------------------------------- */}
      <Section tone="secondary">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Badge tone="accent">Launching soon</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Be first on the new network
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-secondary/80">
              Leave your email and we&rsquo;ll tell you the day it goes live —
              along with what it means for your lanes.
            </p>
          </div>
          <NotifyForm />
        </div>
      </Section>
    </>
  );
}
