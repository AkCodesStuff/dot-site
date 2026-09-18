import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section className="py-24 lg:py-32">
      <SectionHeading
        as="h1"
        eyebrow="404"
        title="This page took a wrong turn"
        description="The link may be out of date, or the page may have moved. Here is where everything else lives."
      />
      <div className="mt-10 flex flex-wrap gap-3">
        {siteConfig.navigation.map((item) => (
          <ButtonLink key={item.href} href={item.href} variant="outline">
            {item.label}
          </ButtonLink>
        ))}
      </div>
    </Section>
  );
}
