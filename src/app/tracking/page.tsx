import { PageHeader } from "@/components/sections/PageHeader";
import { TrackingWidget } from "@/components/sections/TrackingWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/structured-data";

const description =
  "Track any shipment by booking reference, container number or bill of lading, and see every milestone from collection to final delivery.";

export const metadata = createMetadata({
  title: "Track a shipment",
  description,
  path: "/tracking",
  keywords: [
    "track shipment",
    "container tracking",
    "bill of lading tracking",
    "freight tracking",
  ],
});

const referenceTypes = [
  {
    name: "Booking reference",
    body: "The code on your booking confirmation, in the form MRD-0000000.",
  },
  {
    name: "Container number",
    body: "Four letters and seven digits, printed on the container door.",
  },
  {
    name: "Bill of lading",
    body: "The master or house B/L number issued by the carrier.",
  },
  {
    name: "Purchase order",
    body: "Your own PO number, if it was supplied at booking.",
  },
];

const faqs = [
  {
    question: "How often is tracking information updated?",
    answer:
      "Milestone events stream in from carriers, terminals and drivers as they happen. Ocean shipments typically update several times a day; road shipments update continuously while the vehicle is moving.",
  },
  {
    question: "Why does my estimated arrival date keep changing?",
    answer:
      "The ETA is recalculated from live vessel position, terminal congestion and historical performance on the lane rather than from the original schedule, so it moves as conditions change.",
  },
  {
    question: "Can I get tracking updates automatically?",
    answer:
      "Yes. Email and webhook notifications can be configured per shipment or per lane so your systems are updated without anyone checking a portal.",
  },
  {
    question: "My reference is not being recognised. What now?",
    answer:
      "References can take up to an hour to propagate after booking. If it still fails, contact the control tower with the reference and we will locate the shipment.",
  },
];

export default function TrackingPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Tracking", path: "/tracking" },
          ]),
          faqSchema(faqs),
        ]}
      />

      <PageHeader
        eyebrow="Tracking"
        title="Where is my shipment?"
        description={description}
      >
        <TrackingWidget />
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="What you can search"
          title="Four ways to find a shipment"
          description="Any of these will resolve to the same shipment record."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {referenceTypes.map((item) => (
            <Card key={item.name}>
              <CardTitle>{item.name}</CardTitle>
              <CardBody>{item.body}</CardBody>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <SectionHeading
            eyebrow="FAQ"
            title="Tracking questions"
            description="The four we are asked most often."
          />
          <dl className="divide-y divide-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6 first:pt-0 last:pb-0">
                <dt className="text-base font-semibold tracking-tight">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-on-muted">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tone="primary">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Still cannot find it?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-on-primary/80">
              The control tower is staffed 24/7. Call {siteConfig.contact.phone}{" "}
              or send us the reference and we will track it down.
            </p>
          </div>
          <ButtonLink href="/contact" variant="accent" size="lg">
            Contact the control tower
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
