import { IntroDoors } from "@/components/new-home/IntroDoors";
import { NewHomeFooterCta } from "@/components/new-home/NewHomeFooterCta";
import { NewHomeServices } from "@/components/new-home/NewHomeServices";
import { TruckSequence } from "@/components/new-home/TruckSequence";
import { createMetadata } from "@/lib/seo";

/**
 * Staging route for the Dot Truckers landing page rebuild. Deliberately NOT
 * wired into `siteConfig.navigation` and not gated behind `siteConfig.comingSoon`
 * — it is here to be previewed, then promoted over `src/app/page.tsx` later.
 * `noIndex` until that swap happens, so it never competes with Home in search.
 */
export const metadata = createMetadata({
  title: "Dot Truckers — new landing page",
  description:
    "Preview of the new Dot Truckers Limited landing page: long-haul, full-truckload freight moved across India.",
  path: "/new-home",
  noIndex: true,
});

export default function NewHomePage() {
  return (
    <>
      <IntroDoors />
      <TruckSequence />
      <NewHomeServices />
      <NewHomeFooterCta />
    </>
  );
}
