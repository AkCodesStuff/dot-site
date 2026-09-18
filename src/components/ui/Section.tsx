import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Tone = "background" | "surface" | "primary" | "muted";

const toneClasses: Record<Tone, string> = {
  background: "bg-background text-on-background",
  surface: "bg-surface text-on-surface",
  primary: "bg-primary text-on-primary",
  muted: "bg-muted text-on-muted",
};

/** A full-width band of page content with consistent vertical rhythm. */
export function Section({
  children,
  className,
  tone = "background",
  id,
  as: Tag = "section",
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  id?: string;
  as?: "section" | "div" | "footer" | "header";
  /** Skip the Container wrapper when the child manages its own width. */
  bleed?: boolean;
}) {
  return (
    <Tag id={id} className={cn(toneClasses[tone], "py-16 sm:py-20 lg:py-24", className)}>
      {bleed ? children : <Container>{children}</Container>}
    </Tag>
  );
}
