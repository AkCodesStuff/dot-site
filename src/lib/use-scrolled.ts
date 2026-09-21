"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * `true` once the page has scrolled more than `px` pixels.
 *
 * Built on `useSyncExternalStore` rather than an effect + state, so it reads
 * scroll position without a cascading render, and it is `false` on the server
 * so the first client render matches the prerendered HTML.
 *
 * Pass a function for a threshold that depends on the viewport — it is read
 * on every scroll and resize, so a distance expressed in viewport heights
 * keeps up with the window instead of going stale.
 */
export function useScrolledPast(px: number | (() => number)): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > (typeof px === "function" ? px() : px),
    () => false,
  );
}
