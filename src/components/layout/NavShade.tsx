"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/layout/Logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** How far (px) the shade must be swiped up before letting go closes it. */
const SWIPE_CLOSE_PX = 60;
/** Movement (px) below which a press on the handle still counts as a tap. */
const TAP_SLOP_PX = 6;

/**
 * ============================================================================
 * NAV SHADE — mobile navigation, styled as a phone notification centre
 * ============================================================================
 * Slides down from the top of the screen. Each page is a notification card:
 * app icon, app name, a timestamp, the page name and its description.
 *
 * It is opened by the navbar (pull the bar down, tap the collapsed strip, or
 * the menu button) and closed by swiping it back up, tapping outside, tapping
 * the handle, pressing Escape, or picking a page.
 *
 * `pullOffset` is how far the user has dragged the navbar down so far; while
 * it is set, the shade tracks the finger instead of animating.
 */
export function NavShade({
  open,
  pullOffset,
  shownAt,
  isActive,
  onClose,
}: {
  open: boolean;
  pullOffset: number | null;
  /** Epoch ms when the shade was summoned — drives the clock in its header. */
  shownAt: number | null;
  isActive: (href: string) => boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [closeDrag, setCloseDrag] = useState<number | null>(null);
  const swipe = useRef<{ startY: number; moved: boolean } | null>(null);

  const shown = open || pullOffset !== null;

  // Lock page scroll, listen for Escape, and move focus into the shade while
  // it is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // --- Swipe-up-to-close, on the clock header and the bottom handle ---------
  const swipeHandlers = {
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      swipe.current = { startY: event.clientY, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      if (!swipe.current) return;
      const dy = event.clientY - swipe.current.startY;
      if (Math.abs(dy) > TAP_SLOP_PX) swipe.current.moved = true;
      // Only upward movement moves the shade; it is already fully open.
      setCloseDrag(Math.min(0, dy));
    },
    onPointerUp(event: React.PointerEvent<HTMLElement>) {
      if (!swipe.current) return;
      const dy = event.clientY - swipe.current.startY;
      const moved = swipe.current.moved;
      swipe.current = null;
      setCloseDrag(null);
      if (dy < -SWIPE_CLOSE_PX) onClose();
      // A plain tap on the handle closes too; a drag that snapped back doesn't.
      else if (!moved && event.currentTarget.dataset.tapCloses) onClose();
    },
    onPointerCancel() {
      swipe.current = null;
      setCloseDrag(null);
    },
  };

  // --- Panel position --------------------------------------------------------
  // While a finger is on it the panel follows directly (inline transform, no
  // transition). Otherwise it animates between the two resting positions.
  let dragTransform: string | undefined;
  if (pullOffset !== null) {
    dragTransform = `translateY(min(0px, calc(-100% + ${pullOffset}px)))`;
  } else if (closeDrag !== null) {
    dragTransform = `translateY(${closeDrag}px)`;
  }
  const tracking = dragTransform !== undefined;

  const time = shownAt
    ? new Date(shownAt).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const date = shownAt
    ? new Date(shownAt).toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  const cascade = (index: number) => ({
    transitionDelay: shown ? `${60 + index * 45}ms` : "0ms",
  });
  const cascadeClasses = cn(
    "transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
    shown ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] lg:hidden",
        shown ? "pointer-events-auto" : "pointer-events-none",
      )}
      inert={!shown}
    >
      {/* Backdrop — tap outside to dismiss. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-overlay/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        id="mobile-navigation"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        style={dragTransform ? { transform: dragTransform } : undefined}
        className={cn(
          "absolute inset-x-0 top-0 flex max-h-[88svh] flex-col rounded-b-3xl border-b border-border",
          "bg-background/90 text-on-background outline-none backdrop-blur-xl",
          !tracking &&
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
          !tracking && (open ? "translate-y-0" : "-translate-y-full"),
        )}
      >
        {/* --- Clock header (also a swipe-up zone) -------------------------- */}
        <div
          {...swipeHandlers}
          className="touch-none select-none px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-5xl font-semibold leading-none tracking-tight tabular-nums">
                {time}
              </p>
              <p className="mt-2 text-sm font-medium text-on-muted">{date}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Close navigation"
              className="grid h-9 w-9 place-items-center rounded-full bg-muted text-on-background"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sections</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-on-surface">
              {siteConfig.navigation.length}
            </span>
          </div>
        </div>

        {/* --- Notifications ------------------------------------------------ */}
        <ul className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-3">
          {siteConfig.navigation.map((item, index) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} style={cascade(index)} className={cascadeClasses}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex gap-3 rounded-2xl border p-3.5 transition-colors",
                    active
                      ? "border-accent bg-surface-raised"
                      : "border-border bg-surface-raised/80 active:bg-muted",
                  )}
                >
                  <AppIcon />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-on-muted">
                      <span className="font-semibold uppercase tracking-[0.12em]">
                        {siteConfig.shortName}
                      </span>
                      <span className={cn(active && "font-semibold text-secondary")}>
                        {active ? "You’re here" : "now"}
                      </span>
                    </div>
                    <p className="mt-0.5 font-semibold text-on-surface-raised">
                      {item.label}
                    </p>
                    {item.description ? (
                      <p className="truncate text-sm text-on-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}

          {/* The call to action, as the one highlighted notification. */}
          <li
            style={cascade(siteConfig.navigation.length)}
            className={cn("pb-1", cascadeClasses)}
          >
            <Link
              href={siteConfig.navCta.href}
              onClick={onClose}
              className="flex items-center justify-between gap-3 rounded-2xl bg-accent p-3.5 font-semibold text-on-accent"
            >
              {siteConfig.navCta.label}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </li>
        </ul>

        {/* --- Handle: swipe up (or tap) to close --------------------------- */}
        <button
          type="button"
          data-tap-closes="true"
          aria-label="Close navigation"
          {...swipeHandlers}
          className="flex touch-none select-none justify-center pb-3 pt-4"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-12 rounded-full bg-on-muted/40"
          />
        </button>
      </div>
    </div>
  );
}

/** The DOT mark on a black rounded square, like an app icon. */
function AppIcon() {
  return (
    <span
      aria-hidden="true"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"
    >
      <LogoMark className="h-6 w-6" />
    </span>
  );
}
