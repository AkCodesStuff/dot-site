"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { NavShade } from "@/components/layout/NavShade";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { useScrolledPast } from "@/lib/use-scrolled";
import { cn } from "@/lib/utils";

/** Scroll distance after which the bar tucks itself away. */
const COLLAPSE_AFTER_PX = 80;
/** Grace period before a hovered-open bar tucks away again (desktop). */
const PEEK_CLOSE_DELAY_MS = 220;
/** Movement before a press on the bar turns into a pull (mobile). */
const PULL_SLOP_PX = 8;
/** How far the bar must be pulled before letting go opens the shade. */
const PULL_OPEN_PX = 90;
/** Tailwind's `lg` breakpoint — where hover-peek takes over from the shade. */
const DESKTOP_QUERY = "(min-width: 64rem)";

const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

/**
 * ============================================================================
 * NAVBAR
 * ============================================================================
 * Tabs come from `siteConfig.navigation` — add or reorder them there, never
 * here. Every tab is a real route (`/careers`, `/contact`, ...), so it is a
 * page navigation, not an on-page anchor.
 *
 * Layout: [ logo ] ......... [ tabs ] [ CTA ]   (desktop)
 *         [ logo ] ................. [ menu ]   (mobile, <lg)
 *
 * BEHAVIOUR
 * - At the top of the page the bar is fully visible.
 * - Once scrolled, it tucks up behind the top edge, leaving a thin strip of
 *   the same bar showing — like a phone's notification bar.
 * - Desktop: hovering the strip (or tabbing into it) drops the bar back down;
 *   it tucks away again shortly after the pointer leaves.
 * - Mobile: pulling the bar down drags a notification-style shade after the
 *   finger (see `NavShade`). Tapping the strip or the menu button opens it too.
 */
export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(COLLAPSE_AFTER_PX);

  const [peeking, setPeeking] = useState(false);
  const [shadeOpen, setShadeOpen] = useState(false);
  const [pullOffset, setPullOffset] = useState<number | null>(null);
  const [shownAt, setShownAt] = useState<number | null>(null);

  const leaveTimer = useRef<number | undefined>(undefined);
  const pull = useRef<{ startY: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);

  const collapsed = scrolled && !peeking;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const openShade = () => {
    setShownAt(Date.now());
    setShadeOpen(true);
  };
  const closeShade = useCallback(() => setShadeOpen(false), []);

  // The shade is mobile-only; drop it if the window is widened to desktop.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) setShadeOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Don't leave a pending tuck-away timer behind on unmount.
  useEffect(() => {
    const timer = leaveTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  // --- Desktop: hover / focus to peek ---------------------------------------
  const peek = () => {
    if (!isDesktop()) return;
    window.clearTimeout(leaveTimer.current);
    setPeeking(true);
  };
  const tuckSoon = () => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(
      () => setPeeking(false),
      PEEK_CLOSE_DELAY_MS,
    );
  };

  // --- Mobile: pull down to drag the shade open -----------------------------
  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    // A drag on touch never produces a click, so a suppression left over
    // from the previous gesture would otherwise swallow this press's tap.
    suppressClick.current = false;
    if (isDesktop() || shadeOpen) return;
    pull.current = { startY: event.clientY, dragging: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!pull.current) return;
    const dy = event.clientY - pull.current.startY;
    if (!pull.current.dragging) {
      if (dy < PULL_SLOP_PX) return;
      // Past the slop: this is a pull, not a tap. Capture the pointer so the
      // drag keeps tracking outside the bar, and stamp the shade's clock.
      pull.current.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setShownAt(Date.now());
    }
    setPullOffset(Math.max(0, dy));
  };
  const endPull = (event: React.PointerEvent<HTMLElement>) => {
    if (!pull.current) return;
    const wasDragging = pull.current.dragging;
    const dy = event.clientY - pull.current.startY;
    pull.current = null;
    if (!wasDragging) return;

    // A drag must not also register as a tap on whatever it started on.
    suppressClick.current = true;
    setPullOffset(null);
    if (dy > PULL_OPEN_PX) setShadeOpen(true);
  };
  const cancelPull = () => {
    pull.current = null;
    setPullOffset(null);
  };

  return (
    <>
      <header
        onMouseEnter={peek}
        onMouseLeave={tuckSoon}
        onFocus={peek}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) tuckSoon();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPull}
        onPointerCancel={cancelPull}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={() => {
          // On mobile, a tap on the tucked-away strip opens the shade.
          if (collapsed && !isDesktop()) openShade();
        }}
        className={cn(
          "fixed top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md translate-x-1/2 right-1/2 rounded-b-2xl",
          // Tuck up so only the bottom strip of the bar stays on screen.
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          collapsed && "-translate-y-[calc(100%-0.625rem)]",
          // Stop the browser scrolling or pull-to-refreshing under a pull.
          "touch-none lg:touch-auto",
        )}
      >
        <Container>
          <nav
            aria-label="Primary"
            className="flex h-16 items-center justify-between gap-4 lg:h-20"
          >
            {/* --- Logo slot ------------------------------------------------ */}
            {/* <Logo className="text-primary" /> */}

            {/* --- Desktop tabs --------------------------------------------- */}
            <ul className="hidden items-center gap-1 lg:flex">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    title={item.description}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                      isActive(item.href)
                        ? "text-primary"
                        : "text-on-muted hover:text-on-background",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-accent transition-opacity duration-200",
                        isActive(item.href) ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            {/* --- Desktop CTA ---------------------------------------------- */}
            {/* To restore: re-add `import { ButtonLink } from "@/components/ui/Button";`
            <div className="hidden lg:block">
              <ButtonLink
                href={siteConfig.navCta.href}
                variant="accent"
                size="sm"
              >
                {siteConfig.navCta.label}
              </ButtonLink>
            </div> */}

            {/* --- Mobile toggle -------------------------------------------- */}
            <button
              type="button"
              onClick={openShade}
              aria-expanded={shadeOpen}
              aria-controls="mobile-navigation"
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-on-background lg:hidden"
            >
              <MenuIcon />
            </button>
          </nav>
        </Container>

        {/* Handle on the tucked-away strip — the "notification bar" grip.
            It is also the strip's hit area: it starts at the top of the 10px
            strip and reaches 30px below it. That matters for more than finger
            size — once the bar is tucked away the nav's box sits almost
            entirely above the viewport, and Chrome's touch hit-testing lets
            touches on that sliver fall straight through to the page. A box
            that is fully on screen is hit reliably, so this one takes the
            touches (and the hover) and they bubble up to the header. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-[calc(100%-0.625rem)] flex h-10 justify-center pt-0.75",
            collapsed ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <span
            className={cn(
              "h-1 w-8 rounded-full bg-on-muted/50 transition-opacity duration-300",
              collapsed ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
      </header>

      <NavShade
        open={shadeOpen}
        pullOffset={pullOffset}
        shownAt={shownAt}
        isActive={isActive}
        onClose={closeShade}
      />
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
