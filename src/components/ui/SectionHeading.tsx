import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Eyebrow + heading + supporting copy.
 *
 * `as` controls the heading level so each page keeps a valid h1 -> h2 -> h3
 * outline, which is what crawlers and screen readers rely on.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Tag = "h2",
  className,
  invert = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
  /**
    * Set on a tinted band (Deep Blue, Black) where the section already sets an
    * inverted text colour. Inherits that colour instead of picking its own.
    */
  invert?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-[0.18em]",
            invert ? "text-accent" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Tag
        className={cn(
          "text-balance font-semibold tracking-tight",
          Tag === "h1"
            ? "text-4xl sm:text-5xl lg:text-6xl"
            : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Tag>

      {description ? (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-pretty",
            invert ? "text-current opacity-80" : "text-on-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
