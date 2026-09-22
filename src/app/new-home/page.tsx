import { HowItWorks } from "@/components/new-home/HowItWorks";
import { IntroDoors } from "@/components/new-home/IntroDoors";
import { NewHomeFooterCta } from "@/components/new-home/NewHomeFooterCta";
import { RoadNetwork } from "@/components/new-home/RoadNetwork";
import { TruckSequence } from "@/components/new-home/TruckSequence";
import { TrustStrip } from "@/components/new-home/TrustStrip";
import { createMetadata } from "@/lib/seo";
import { Footer } from "@/components/layout/Footer";
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
    <RoadNetwork>
      <IntroDoors />
      <TruckSequence />
      <TrustStrip />
    
      <Footer />
    </RoadNetwork>
  );
}
