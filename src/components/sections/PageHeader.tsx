import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * The banner at the top of every inner page. Carries the page's single `h1`,
 * which keeps the heading outline valid for crawlers and screen readers.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-surface text-on-surface">
      <Container className="py-16 lg:py-24">
        <SectionHeading
          as="h1"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}
