"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

/**
 * Hides the footer on whichever page is currently showing the `ComingSoon`
 * placeholder (see `siteConfig.comingSoon`) — a placeholder page doesn't
 * need a full footer repeating contact info and nav links already visible
 * on it. Always shows on Home, and everywhere once `comingSoon` is off.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  const hideOnComingSoon = siteConfig.comingSoon && pathname !== "/";

  if (hideOnComingSoon) return null;
  return <Footer />;
}
