import { Hero } from "@/components/sections/Hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data";

export const metadata = createMetadata({
  title: "Freight forwarding and supply chain logistics",
  description: siteConfig.description,
  path: "/",
  keywords: [
    "freight forwarding",
    "third party logistics",
    "supply chain management",
    "warehousing",
    "customs clearance",
  ],
});

const services = [
  {
    name: "Ocean & air freight",
    description:
      "FCL, LCL and consolidated air cargo with vetted carrier capacity on every major trade lane.",
  },
  {
    name: "Road & rail",
    description:
      "Full and part truckload across the network, with intermodal rail for long-haul cost efficiency.",
  },
  {
    name: "Bonded warehousing",
    description:
      "Temperature-controlled and bonded storage, pick-and-pack, and inventory visibility down to the SKU.",
  },
  {
    name: "Customs & compliance",
    description:
      "In-house brokerage handling classification, duty optimisation and documentation in 40+ markets.",
  },
  {
    name: "Last-mile delivery",
    description:
      "Scheduled and same-day delivery with proof of delivery captured at the door.",
  },
  {
    name: "Control tower",
    description:
      "One team, one dashboard, and exception alerts before a delay becomes a missed SLA.",
  },
];

const stats = [
  { value: "42", label: "Countries served" },
  { value: "1.8M", label: "Shipments per year" },
  { value: "98.6%", label: "On-time delivery" },
  { value: "24/7", label: "Control tower coverage" },
];

const differentiators = [
  {
    title: "One platform, end to end",
    body: "Quote, book, track and reconcile in a single system instead of stitching together carrier portals and spreadsheets.",
  },
  {
    title: "Visibility that is actually live",
    body: "Milestone events stream in from carriers, terminals and drivers, so your ETA reflects reality rather than the original plan.",
  },
  {
    title: "Named operational owners",
    body: "Every account gets a dedicated coordinator who knows your lanes, your cut-offs and your customers.",
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
        eyebrow="Global freight, handled"
        title="Move freight with fewer surprises"
        description={siteConfig.description}
        primaryCta={{ label: "Request a quote", href: "/contact" }}
        secondaryCta={{ label: "Track a shipment", href: "/tracking" }}
      />

      {/* --- Stats ---------------------------------------------------------- */}
      <Section className="py-12 sm:py-14 lg:py-16">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-4xl font-semibold tracking-tight text-primary">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm text-on-muted">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* --- Services ------------------------------------------------------- */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="What we do"
          title="A full logistics stack, not a patchwork of vendors"
          description="Pick the pieces you need today and add the rest as your volumes grow — the contracts, the systems and the reporting stay the same."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.name} className="hover:border-secondary">
              <CardTitle>{service.name}</CardTitle>
              <CardBody>{service.description}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      {/* --- Why us --------------------------------------------------------- */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            eyebrow="Why shippers switch"
            title="Built for the days when the plan changes"
            description="Anyone can move a container when nothing goes wrong. The difference shows up at the port strike, the failed customs entry and the missed collection."
          />

          <ul className="space-y-6">
            {differentiators.map((item) => (
              <li
                key={item.title}
                className="border-l-2 border-accent pl-5"
              >
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* --- CTA ------------------------------------------------------------ */}
      <Section tone="secondary">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Badge tone="accent">Free lane analysis</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Send us your three worst lanes
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-secondary/80">
              We will come back within two business days with routing options,
              indicative rates and where the time is actually being lost.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="accent" size="lg">
              Talk to us
            </ButtonLink>
            <ButtonLink href="/technology" variant="onOverlay" size="lg">
              See the platform
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
