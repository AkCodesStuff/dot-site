"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * `true` when the visitor has asked their system to reduce motion.
 *
 * Same shape as `useScrolledPast`: `useSyncExternalStore` so it reads the
 * media query without a cascading render, and `false` on the server so the
 * first client render matches the prerendered HTML — a reduced-motion visitor
 * swaps to the static layout on hydration, before any animation is set up.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
