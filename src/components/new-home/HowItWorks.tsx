"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { Container } from "@/components/ui/Container";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  {
    name: "Request a quote",
    body: "Send us the lane, the load and the date you need it there.",
  },
  {
    name: "Truck assigned",
    body: "A vehicle and driver are booked to your consignment, not to a pool.",
  },
  {
    name: "Live tracking",
    body: "Follow the run and a self-updating ETA from pickup onward.",
  },
  {
    name: "Delivery + POD",
    body: "Proof of delivery is filed against the shipment the moment it lands.",
  },
];

/** Four steps across on desktop, stacked below. Same light reveal as the strip. */
export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from("[data-step]", {
        y: 24,
        autoAlpha: 0,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "[data-steps]",
          start: "top 88%",
          end: "top 50%",
          scrub: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      className="bg-surface py-20 text-on-surface lg:py-28"
    >
      <Container>
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          How it works
        </p>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold uppercase leading-[1.05] tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Four steps from quote to proof of delivery.
        </h2>

        <ol data-steps className="mt-14 grid gap-10 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.name} data-step className="border-t border-border pt-5">
              <span className="font-ui text-sm font-bold tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {step.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
