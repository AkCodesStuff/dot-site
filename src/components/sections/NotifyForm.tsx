"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * Template "notify me when it lands" capture for the upgrade landing page.
 *
 * No backend yet: replace `handleSubmit` with a POST to a route handler or a
 * Server Action wired to your CRM or mailing list. The states are already here.
 */
const fieldClasses =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm " +
  "text-on-background placeholder:text-on-muted focus:border-outline";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    // TODO: send the address to your backend / mailing list here.
    setStatus("sent");
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="notify-email" className="sr-only">
            Work email
          </label>
          <input
            id="notify-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className={fieldClasses}
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="sm:w-auto">
          Keep me posted
        </Button>
      </form>

      <p aria-live="polite" className="mt-3 text-sm opacity-80">
        {status === "sent"
          ? "Thanks — this demo form is not wired up to a backend yet."
          : "One email when the new platform goes live. Nothing else."}
      </p>
    </div>
  );
}
