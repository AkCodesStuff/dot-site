"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { Container } from "@/components/ui/Container";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Placeholder figures — swap for audited numbers before this goes live. */
const PROOF = [
  { value: "99.2%", label: "On-time delivery" },
  { value: "24/7", label: "Control tower staffed" },
  { value: "12", label: "Regional hubs" },
  { value: "4.8/5", label: "Average shipper rating" },
];

/**
 * First band after the pin releases. It stays dark so the night the sequence
 * ended on carries past the pin instead of snapping back to daylight the
 * instant the truck scrolls away; `HowItWorks` below is where the page returns
 * to the light theme. Light fade and lift, nothing more.
 */
export function TrustStrip() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from("[data-proof]", {
        y: 20,
        autoAlpha: 0,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 88%",
          end: "top 55%",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={sectionRef} className="bg-primary text-on-primary">
      <Container className="py-14 lg:py-16">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-0">
          {PROOF.map((item) => (
            <div
              key={item.label}
              data-proof
              className="lg:border-l lg:border-on-primary/15 lg:px-8 lg:first:border-l-0 lg:first:pl-0"
            >
              <dd className="font-ui text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                {item.value}
              </dd>
              <dt className="mt-2 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-on-primary/60">
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
