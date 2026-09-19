"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/**
 * Template tracking widget - runs entirely on demo data.
 *
 * To make it live, replace `lookup()` with a call to your tracking API
 * (route handler or Server Action) and map the response onto `TrackingResult`.
 * Loading, not-found and success states are already wired.
 */

type Milestone = {
  label: string;
  location: string;
  timestamp: string;
  state: "done" | "current" | "upcoming";
};

type TrackingResult = {
  reference: string;
  status: string;
  tone: "success" | "info" | "warning";
  mode: string;
  origin: string;
  destination: string;
  eta: string;
  milestones: Milestone[];
};

const DEMO_REFERENCE = "MRD-4820193";

const demoResult: TrackingResult = {
  reference: DEMO_REFERENCE,
  status: "In transit",
  tone: "success",
  mode: "Ocean FCL - 40ft HC",
  origin: "Shanghai, CN",
  destination: "Newark, NJ, US",
  eta: "12 Oct 2026",
  milestones: [
    {
      label: "Booking confirmed",
      location: "Shanghai, CN",
      timestamp: "18 Sep 2026, 09:14",
      state: "done",
    },
    {
      label: "Container gated in",
      location: "Yangshan Terminal",
      timestamp: "20 Sep 2026, 16:02",
      state: "done",
    },
    {
      label: "Vessel departed",
      location: "Shanghai, CN",
      timestamp: "22 Sep 2026, 03:40",
      state: "done",
    },
    {
      label: "In transit",
      location: "Pacific Ocean",
      timestamp: "Updated 2 hours ago",
      state: "current",
    },
    {
      label: "Customs clearance",
      location: "Newark, NJ, US",
      timestamp: "Expected 11 Oct 2026",
      state: "upcoming",
    },
    {
      label: "Delivered",
      location: "Newark, NJ, US",
      timestamp: "Expected 12 Oct 2026",
      state: "upcoming",
    },
  ],
};

const fieldClasses =
  "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm " +
  "text-on-background placeholder:text-on-muted focus:border-outline";

export function TrackingWidget() {
  const [reference, setReference] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing">(
    "idle",
  );
  const [result, setResult] = useState<TrackingResult | null>(null);

  function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = reference.trim().toUpperCase();
    if (!query) return;

    setState("loading");

    // TODO: swap this timeout for a real request to your tracking API.
    window.setTimeout(() => {
      if (query === DEMO_REFERENCE) {
        setResult(demoResult);
        setState("found");
      } else {
        setResult(null);
        setState("missing");
      }
    }, 450);
  }

  return (
    <div>
      <form
        onSubmit={lookup}
        className="flex flex-col gap-3 sm:flex-row"
        aria-label="Track a shipment"
      >
        <div className="flex-1">
          <label htmlFor="reference" className="sr-only">
            Shipment reference, container number or bill of lading
          </label>
          <input
            id="reference"
            name="reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder={`e.g. ${DEMO_REFERENCE}`}
            autoComplete="off"
            className={fieldClasses}
          />
        </div>
        <Button type="submit" variant="accent" size="lg" className="sm:w-auto">
          {state === "loading" ? "Searching..." : "Track shipment"}
        </Button>
      </form>

      <p className="mt-3 text-sm text-on-muted">
        Demo data only - try <code className="font-mono">{DEMO_REFERENCE}</code>.
      </p>

      <div aria-live="polite" className="mt-8">
        {state === "missing" ? (
          <div className="rounded-2xl border border-border bg-surface-raised p-6 text-on-surface-raised">
            <h3 className="text-lg font-semibold tracking-tight">
              No shipment found
            </h3>
            <p className="mt-2 text-sm text-on-muted">
              Check the reference and try again, or contact the control tower
              and we will find it for you.
            </p>
          </div>
        ) : null}

        {state === "found" && result ? <TrackingResultCard result={result} /> : null}
      </div>
    </div>
  );
}

function TrackingResultCard({ result }: { result: TrackingResult }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-raised p-6 text-on-surface-raised sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-on-muted">{result.reference}</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">
            {result.origin} to {result.destination}
          </h3>
        </div>
        <Badge tone={result.tone}>{result.status}</Badge>
      </div>

      <dl className="mt-6 grid gap-4 border-y border-border py-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-on-muted">
            Mode
          </dt>
          <dd className="mt-1 text-sm font-medium">{result.mode}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-on-muted">
            Estimated arrival
          </dt>
          <dd className="mt-1 text-sm font-medium">{result.eta}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-on-muted">
            Destination
          </dt>
          <dd className="mt-1 text-sm font-medium">{result.destination}</dd>
        </div>
      </dl>

      <ol className="mt-6 space-y-0">
        {result.milestones.map((milestone, index) => (
          <li key={milestone.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={
                  milestone.state === "upcoming"
                    ? "mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-border bg-background"
                    : milestone.state === "current"
                      ? "mt-1.5 h-3 w-3 shrink-0 rounded-full bg-accent ring-4 ring-accent/25"
                      : "mt-1.5 h-3 w-3 shrink-0 rounded-full bg-success"
                }
              />
              {index < result.milestones.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="my-1 w-px flex-1 bg-border"
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p className="text-sm font-semibold">{milestone.label}</p>
              <p className="mt-0.5 text-sm text-on-muted">
                {milestone.location} - {milestone.timestamp}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
