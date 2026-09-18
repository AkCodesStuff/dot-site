"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * Template contact form - intentionally has no backend yet.
 *
 * To make it live, replace `handleSubmit` with a POST to a route handler
 * (`src/app/api/contact/route.ts`) or a Server Action, and add spam
 * protection. The markup, labels and success state are already here.
 */
const enquiryTypes = [
  "Request a quote",
  "Existing shipment",
  "Warehousing",
  "Customs & compliance",
  "Careers",
  "Something else",
];

const fieldClasses =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm " +
  "text-on-background placeholder:text-on-muted focus:border-outline";

const labelClasses = "mb-2 block text-sm font-medium text-on-surface";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: post the form data to your backend / CRM here.
    setStatus("sent");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface-raised p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClasses}>
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jordan Ellis"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="company" className={labelClasses}>
            Company
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Acme Trading"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jordan@acme.com"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            className={fieldClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="enquiry" className={labelClasses}>
            What is this about?
          </label>
          <select
            id="enquiry"
            name="enquiry"
            defaultValue={enquiryTypes[0]}
            className={fieldClasses}
          >
            {enquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClasses}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Origin, destination, commodity, volume and target dates."
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Send message
        </Button>
        {status === "sent" ? (
          <p role="status" className="text-sm font-medium text-success">
            Thanks - this demo form is not wired up to a backend yet.
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-on-muted">
        By submitting you agree we may contact you about your enquiry.
      </p>
    </form>
  );
}
