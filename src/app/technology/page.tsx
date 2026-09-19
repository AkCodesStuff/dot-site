import { PageHeader } from "@/components/sections/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, serviceSchema } from "@/lib/structured-data";

const description =
  "A single logistics platform for quoting, booking, tracking and reporting — with a documented REST API, EDI support and webhooks into the systems you already run.";

export const metadata = createMetadata({
  title: "Technology",
  description,
  path: "/technology",
  keywords: [
    "logistics platform",
    "shipment tracking API",
    "EDI integration",
    "transport management system",
  ],
});

const capabilities = [
  {
    name: "Control tower dashboard",
    body: "Every shipment, every exception and every document in one view, filtered by lane, customer or carrier.",
  },
  {
    name: "Predictive ETAs",
    body: "Carrier milestones, terminal dwell and historical lane performance combine into an ETA that updates itself.",
  },
  {
    name: "Rate management",
    body: "Contracted and spot rates side by side, with landed cost calculated before you commit to a booking.",
  },
  {
    name: "Document vault",
    body: "Bills of lading, commercial invoices and customs entries stored against the shipment and searchable for seven years.",
  },
  {
    name: "Exception alerting",
    body: "Rules you define — a missed cut-off, a temperature breach, a rolled container — pushed to email, Slack or webhook.",
  },
  {
    name: "Reporting & audit",
    body: "Scheduled exports, spend analysis by lane, and a full audit trail on every status change.",
  },
];

const integrations = [
  {
    name: "REST API",
    body: "Token-authenticated JSON endpoints for quotes, bookings, tracking events and documents.",
  },
  {
    name: "Webhooks",
    body: "Signed event callbacks so your systems react the moment a milestone lands.",
  },
  {
    name: "EDI",
    body: "ANSI X12 and EDIFACT message sets for partners still running traditional pipelines.",
  },
  {
    name: "ERP & WMS connectors",
    body: "Pre-built links into the common ERP, WMS and e-commerce platforms.",
  },
];

const securityPoints = [
  "Role-based access with SSO and SCIM provisioning",
  "Data encrypted in transit and at rest",
  "Regional data residency options",
  "Independent penetration testing on an annual cycle",
];

export default function TechnologyPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Technology", path: "/technology" },
          ]),
          serviceSchema({
            name: "Logistics technology platform",
            description,
            path: "/technology",
          }),
        ]}
      />

      <PageHeader
        eyebrow="Technology"
        title="The software your freight runs on"
        description={description}
      />

      <Section>
        <SectionHeading
          eyebrow="Platform"
          title="What is in the box"
          description="Everything below ships as part of the platform — there is no premium tier for visibility."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => (
            <Card key={item.name} className="hover:border-secondary">
              <CardTitle>{item.name}</CardTitle>
              <CardBody>{item.body}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <SectionHeading
            eyebrow="Integrations"
            title="Connects to what you already run"
            description="Most customers are live on the API inside a fortnight. Sandbox credentials are issued on day one."
          />
          <dl className="grid gap-6 sm:grid-cols-2">
            {integrations.map((item) => (
              <div key={item.name}>
                <dt className="text-base font-semibold tracking-tight">
                  {item.name}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-on-muted">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Security"
            title="Enterprise controls without the enterprise sales cycle"
            description="Your freight data is commercially sensitive. It is treated that way."
          />
          <ul className="space-y-4">
            {securityPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-sm leading-relaxed text-on-muted">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="secondary">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Want a walkthrough with your own lane data?
          </h2>
          <ButtonLink href="/contact" variant="accent" size="lg">
            Book a demo
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 text-accent"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}
