import { PageHeader } from "@/components/sections/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, jobPostingSchema } from "@/lib/structured-data";

const description =
  "Join a logistics team that ships software and freight with the same urgency. Open roles across operations, engineering and customer success.";

export const metadata = createMetadata({
  title: "Careers",
  description,
  path: "/careers",
  keywords: ["logistics jobs", "freight forwarding careers", "supply chain jobs"],
});

/**
 * Replace this array with a fetch from your ATS (Greenhouse, Lever, Ashby...).
 * `jobPostingSchema()` below turns each entry into Google Jobs structured data.
 */
const openRoles = [
  {
    id: "ops-coordinator",
    title: "Freight Operations Coordinator",
    team: "Operations",
    location: "Newark, NJ",
    type: "Full-time",
    datePosted: "2026-09-01",
    summary:
      "Own a book of lanes end to end: bookings, carrier communication, exception handling and customer updates.",
  },
  {
    id: "customs-analyst",
    title: "Customs Compliance Analyst",
    team: "Compliance",
    location: "Rotterdam, NL",
    type: "Full-time",
    datePosted: "2026-08-18",
    summary:
      "Classify goods, prepare entries and keep our brokerage clean across EU and UK customs regimes.",
  },
  {
    id: "platform-engineer",
    title: "Senior Platform Engineer",
    team: "Engineering",
    location: "Remote (US / EU)",
    type: "Full-time",
    datePosted: "2026-09-08",
    summary:
      "Build the tracking pipeline that ingests carrier milestones and turns them into ETAs people trust.",
  },
  {
    id: "warehouse-lead",
    title: "Warehouse Shift Lead",
    team: "Warehousing",
    location: "Dallas, TX",
    type: "Full-time",
    datePosted: "2026-07-29",
    summary:
      "Run a shift across inbound, pick-and-pack and outbound, with safety and accuracy as the scoreboard.",
  },
];

const values = [
  {
    title: "Own the shipment",
    body: "Whoever picks it up sees it through. No hand-offs into a queue where accountability disappears.",
  },
  {
    title: "Say it early",
    body: "A delay flagged on Tuesday is a problem. Flagged on Friday it is a crisis. We reward early bad news.",
  },
  {
    title: "Fix the process",
    body: "Heroics get the container moving. Better process stops the next one from getting stuck.",
  },
];

const benefits = [
  "Private medical, dental and vision from day one",
  "Hybrid and remote-friendly by default",
  "Annual learning budget and paid certifications",
  "Parental leave above statutory in every market",
  "Shift premiums and overtime paid, always",
  "Employee share option scheme",
];

export default function CareersPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
          ]),
          ...openRoles.map((role) =>
            jobPostingSchema({
              title: role.title,
              description: role.summary,
              employmentType: role.type.toUpperCase().replace("-", "_"),
              location: role.location,
              datePosted: role.datePosted,
            }),
          ),
        ]}
      />

      <PageHeader
        eyebrow="Careers"
        title="Work where the freight actually moves"
        description={description}
      />

      <Section>
        <SectionHeading
          eyebrow="How we work"
          title="Three things we hire for"
          description="Experience is teachable. These are not."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <CardTitle>{value.title}</CardTitle>
              <CardBody>{value.body}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface" id="open-roles">
        <SectionHeading
          eyebrow="Open roles"
          title={`${openRoles.length} positions open right now`}
          description="Nothing that fits? Send a speculative application — we keep good people on file."
        />

        <ul className="mt-12 space-y-4">
          {openRoles.map((role) => (
            <li key={role.id}>
              <article className="flex flex-col gap-5 rounded-2xl border border-border bg-surface-raised p-6 text-on-surface-raised sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{role.team}</Badge>
                    <Badge>{role.type}</Badge>
                    <Badge>{role.location}</Badge>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-muted">
                    {role.summary}
                  </p>
                </div>
                <ButtonLink
                  href={`/contact?role=${role.id}`}
                  variant="outline"
                  className="shrink-0"
                >
                  Apply
                </ButtonLink>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            eyebrow="Benefits"
            title="The package, plainly"
            description="No perks-wall theatrics — the things that actually show up in your contract."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-on-surface"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="secondary">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Not seeing your role?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-secondary/80">
              Tell us what you would want to own. Applications go straight to the
              hiring team at {siteConfig.contact.email}.
            </p>
          </div>
          <ButtonLink href="/contact" variant="accent" size="lg">
            Send an application
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
