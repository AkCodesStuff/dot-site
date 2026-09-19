"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type Industry = {
  name: string;
  description: string;
  image: string;
  icon: "cart" | "storefront" | "gear" | "chip" | "car" | "box";
};

/**
 * Placeholder photography -- see the equivalent note on SolutionsShowcase.
 * Swap for real sector photography when it exists.
 */
const GROUP_A: Industry[] = [
  {
    name: "E-commerce",
    description: "High-frequency movement and distributed fulfilment.",
    image:
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=1000&auto=format&fit=crop&q=80",
    icon: "cart",
  },
  {
    name: "Retail",
    description: "Store, distribution centre and network movements.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80",
    icon: "storefront",
  },
  {
    name: "Manufacturing",
    description: "Reliable movement of materials and finished goods.",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=80",
    icon: "gear",
  },
];

const GROUP_B: Industry[] = [
  {
    name: "Electronics",
    description: "Time-sensitive and carefully controlled transportation.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80",
    icon: "chip",
  },
  {
    name: "Automotive",
    description: "Movement across parts, plants and dealer networks.",
    image:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1000&auto=format&fit=crop&q=80",
    icon: "car",
  },
  {
    name: "Consumer goods",
    description: "Scalable transportation across distribution networks.",
    image:
      "https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=1000&auto=format&fit=crop&q=80",
    icon: "box",
  },
];

/** Extra scroll (vh) the desktop pin runs for. */
const PIN_LENGTH_VH = 90;
const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * ============================================================================
 * INDUSTRIES SHOWCASE
 * ============================================================================
 * `lg` and up: three industries fill the screen at once, pinned. Scrolling
 * crossfades them directly to the other three -- a straight 1:1 read of
 * scroll position, same "grounded" approach as the sections above this one on
 * the home page, so scrolling back up brings the first three straight back.
 * Each card alternates image-on-top / text-on-top along the row, and the two
 * groups use the *opposite* alternation, so the swap exchanges image and text
 * position as well as content. Every image in a row shares one aspect ratio
 * and every text block shares one height, so the row stays level regardless
 * of description length.
 *
 * Below `lg`: no pin -- all six render as a single alternating list, in
 * normal scroll, no swap trick.
 *
 * The heading sits at the top of the pinned stage at its natural height, and
 * the card row takes only what's left below it (`flex-1`) -- the same fix
 * used on `SolutionsShowcase`, so heading + cards fill one screen together
 * rather than the heading sitting above a second, separately full-screen row.
 */
export function IndustriesShowcase() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const rowARef = useRef<HTMLDivElement>(null);
  const rowBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const setOpacity = (progress: number) => {
      if (rowARef.current) rowARef.current.style.opacity = String(1 - progress);
      if (rowBRef.current) rowBRef.current.style.opacity = String(progress);
    };

    if (reduceMotion) {
      // Show group A at rest; nothing to scrub.
      setOpacity(0);
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    let frame = 0;

    const update = () => {
      frame = 0;
      const runway = runwayRef.current;
      if (!runway || !desktopQuery.matches) {
        setOpacity(0);
        return;
      }
      const rect = runway.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) {
        setOpacity(rect.top <= 0 ? 1 : 0);
        return;
      }
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      setOpacity(progress);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    desktopQuery.addEventListener("change", onScroll);
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktopQuery.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <section className="border-b border-border bg-background text-on-background">
      {/* Phone / tablet-portrait heading -- normal flow, not pinned (the
          pinned stage below is `hidden` under `lg`). */}
      <Container className="pb-10 pt-16 sm:pb-12 sm:pt-20 lg:hidden">
        <IndustriesHeading />
      </Container>

      {/* Desktop / tablet-landscape: heading + pinned crossfade, pinned
          together as one 100svh stage. */}
      <div
        ref={runwayRef}
        style={{ height: `calc(100svh + ${PIN_LENGTH_VH}svh)` }}
        className="relative hidden lg:block motion-reduce:h-svh!"
      >
        <div className="sticky top-0 flex h-svh w-full flex-col overflow-hidden">
          <Container className="shrink-0 pb-6 pt-10 lg:pb-8 lg:pt-14">
            <IndustriesHeading compact />
          </Container>

          {/* `min-h-0 flex-1` gives this whatever the heading leaves behind;
              the row sits a fixed distance below the heading rather than
              being vertically centred in that space, which on anything but
              a very short viewport left a huge, viewport-size-dependent gap
              above the row (and another below it) that read as accidental
              rather than designed. Any leftover room now falls below the
              row instead, which is the ordinary, expected way a section
              ends. */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <Container className="w-full">
              {/* Group A sits in normal flow and sets the box's height (both
                  groups share the same card shape, so this height is correct
                  for either); group B is absolutely stacked on top of it, so
                  the two crossfade in the same spot rather than one pushing
                  the other down the page. */}
              <div className="relative mt-8 lg:mt-10">
                <div ref={rowARef} className="grid grid-cols-3 gap-6 opacity-100">
                  {GROUP_A.map((industry, index) => (
                    <IndustryCard
                      key={industry.name}
                      industry={industry}
                      imageFirst={index % 2 === 0}
                    />
                  ))}
                </div>
                <div ref={rowBRef} className="absolute inset-0 grid grid-cols-3 gap-6 opacity-0">
                  {GROUP_B.map((industry, index) => (
                    <IndustryCard
                      key={industry.name}
                      industry={industry}
                      imageFirst={index % 2 !== 0}
                    />
                  ))}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Phone / tablet-portrait: a plain alternating list, no pin. */}
      <Container className="pb-16 sm:pb-20 lg:hidden">
        <div className="grid gap-10 sm:grid-cols-2">
          {[...GROUP_A, ...GROUP_B].map((industry, index) => (
            <IndustryCard
              key={industry.name}
              industry={industry}
              imageFirst={index % 2 === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function IndustriesHeading({ compact = false }: { compact?: boolean }) {
  return (
    <div className="max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
        Industries
      </p>
      <h2
        className={cn(
          "mt-3 font-semibold tracking-tight text-balance",
          compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
        )}
      >
        Built around what you move
      </h2>
      <span aria-hidden="true" className="mt-4 block h-1 w-14 rounded-full bg-accent" />
      {!compact ? (
        <p className="mt-5 text-base leading-relaxed text-on-muted lg:text-lg">
          Transportation and logistics capabilities designed around the
          unique requirements of six different sectors.
        </p>
      ) : null}
    </div>
  );
}

function IndustryCard({
  industry,
  imageFirst,
}: {
  industry: Industry;
  imageFirst: boolean;
}) {
  const image = (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
      <Image
        src={industry.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover"
      />
    </div>
  );

  const text = (
    <div className="flex min-h-42 flex-col justify-center lg:min-h-46">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-full bg-muted text-on-surface"
      >
        <IndustryIcon name={industry.icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-base font-semibold tracking-tight sm:text-lg">
        {industry.name}
      </h3>
      <span aria-hidden="true" className="mt-2 block h-0.5 w-8 rounded-full bg-accent" />
      <p className="mt-2 text-sm leading-relaxed text-on-muted">
        {industry.description}
      </p>
    </div>
  );

  return (
    <article className="flex flex-col gap-4">
      {imageFirst ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          {text}
          {image}
        </>
      )}
    </article>
  );
}

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

function IndustryIcon({ name, className }: { name: Industry["icon"]; className?: string }) {
  switch (name) {
    case "cart":
      return (
        <svg {...iconProps(className)}>
          <path d="M3 4h2l2.4 12.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6" />
          <circle cx="9.5" cy="20" r="1.1" />
          <circle cx="17" cy="20" r="1.1" />
        </svg>
      );
    case "storefront":
      return (
        <svg {...iconProps(className)}>
          <path d="M4 9.5 5 4h14l1 5.5" />
          <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
          <path d="M5 10v9h14v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "gear":
      return (
        <svg {...iconProps(className)}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M3 12h2.2M18.8 12H21M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
        </svg>
      );
    case "chip":
      return (
        <svg {...iconProps(className)}>
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3" />
        </svg>
      );
    case "car":
      return (
        <svg {...iconProps(className)}>
          <path d="M4 16V11.5l2-4.5h12l2 4.5V16" />
          <path d="M4 16h16" />
          <path d="M6 13h12" />
          <circle cx="7.5" cy="16.5" r="1.4" />
          <circle cx="16.5" cy="16.5" r="1.4" />
        </svg>
      );
    case "box":
      return (
        <svg {...iconProps(className)}>
          <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" />
          <path d="M3.5 8v8L12 20l8.5-4V8" />
          <path d="M12 12v8" />
        </svg>
      );
  }
}
