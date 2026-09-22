import Image from "next/image";

import { CLIENTS, SEQUENCE } from "@/components/new-home/config";
import { cn } from "@/lib/utils";

/** Deals the clients into the configured number of marquee rows, in order. */
function toRows() {
  const perRow = Math.ceil(CLIENTS.length / SEQUENCE.clients.rows);
  const rows: (typeof CLIENTS)[] = [];
  for (let i = 0; i < CLIENTS.length; i += perRow) {
    rows.push(CLIENTS.slice(i, i + perRow));
  }
  return rows;
}

/**
 * ============================================================================
 * CLIENT WALL
 * ============================================================================
 * The logo panel under the closing copy. Markup only — `TruckSequence` brings
 * the whole panel in on the scroll timeline and runs the rows' marquee.
 *
 * Each row renders its logos TWICE and the marquee slides it by exactly half
 * its own width, which is what makes the loop seamless: at the moment it
 * resets, the second copy is sitting precisely where the first began. The
 * duplicate is `alt=""` so a screen reader reads the roster once.
 *
 * Logos are whited out (`brightness-0 invert`) rather than shown in brand
 * colour. The panel only ever appears on the blacked-out stage, where a dark
 * logo would simply vanish, and a uniform wall reads as a roster rather than
 * as two dozen competing palettes. It is a static filter, never animated.
 */
export function ClientWall({ animated = false }: { animated?: boolean }) {
  const rows = toRows();

  if (!animated) {
    return (
      <div className="grid grid-cols-3 items-center gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6">
        {CLIENTS.map((client) => (
          <Logo key={client.name} client={client} />
        ))}
      </div>
    );
  }

  return (
    <div
      data-clients
      className="client-wall invisible h-full w-full overflow-hidden opacity-0"
    >
      <div className="flex h-full flex-col justify-center gap-4 md:gap-6">
        {rows.map((row, index) => (
          <div
            key={index}
            data-marquee-row
            className="flex w-max items-center"
          >
            {[...row, ...row].map((client, copy) => (
              <Logo
                key={`${client.name}-${copy}`}
                client={client}
                spaced
                duplicate={copy >= row.length}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Logo({
  client,
  spaced = false,
  duplicate = false,
}: {
  client: (typeof CLIENTS)[number];
  /**
   * Marquee rows space their logos with per-item margins rather than a flex
   * `gap`. It has to be margins: with a gap, half the doubled row's width is
   * out by half a gap, and the loop visibly jumps every pass.
   */
  spaced?: boolean;
  duplicate?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative h-8 w-24 shrink-0 md:h-10 md:w-28",
        spaced && "mx-3 md:mx-4",
      )}
    >
      <Image
        src={client.src}
        alt={duplicate ? "" : client.name}
        fill
        sizes="112px"
        className="object-contain opacity-70 brightness-0 invert"
      />
    </div>
  );
}
