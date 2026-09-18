"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

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
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <Container>
        <nav
          aria-label="Primary"
          className="flex h-16 items-center justify-between gap-4 lg:h-20"
        >
          {/* --- Logo slot ------------------------------------------------ */}
          <Logo className="text-primary" />

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
          <div className="hidden lg:block">
            <ButtonLink href={siteConfig.navCta.href} size="sm">
              {siteConfig.navCta.label}
            </ButtonLink>
          </div>

          {/* --- Mobile toggle -------------------------------------------- */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-on-background lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
      </Container>

      {/* --- Mobile panel ------------------------------------------------- */}
      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="border-t border-border bg-background lg:hidden"
      >
        <Container className="py-4">
          <ul className="flex flex-col gap-1">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200",
                    isActive(item.href)
                      ? "bg-muted text-primary"
                      : "text-on-background hover:bg-muted",
                  )}
                >
                  {item.label}
                  {item.description ? (
                    <span className="mt-0.5 block text-sm font-normal text-on-muted">
                      {item.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          <ButtonLink
            href={siteConfig.navCta.href}
            onClick={closeMenu}
            className="mt-4 w-full"
          >
            {siteConfig.navCta.label}
          </ButtonLink>
        </Container>
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
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
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}
