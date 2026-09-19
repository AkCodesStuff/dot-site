/**
 * ============================================================================
 * SITE URL RESOLUTION — the one place that decides the site's origin.
 * ============================================================================
 * `siteConfig.url` (in `src/config/site.ts`) is built from this function's
 * return value, and every absolute URL in the app is built from
 * `siteConfig.url` in turn: `metadataBase`, canonical links, Open Graph and
 * Twitter metadata, JSON-LD, `sitemap.xml` and `robots.txt` (see
 * `src/lib/seo.ts`, `src/lib/structured-data.ts`, `src/lib/utils.ts#absoluteUrl`,
 * `src/app/sitemap.ts`, `src/app/robots.ts`). There is exactly one resolution
 * path; nothing downstream re-implements it or reads `process.env` directly.
 *
 * RESOLUTION ORDER
 *   1. `NEXT_PUBLIC_SITE_URL`, if it is set to a real, parseable absolute
 *      URL. Set this to the custom production domain; it wins everywhere,
 *      in every environment.
 *   2. `VERCEL_URL`, if present. Vercel sets this automatically on every
 *      deployment — production and every preview alike — so preview
 *      deployments get their own correct origin with no per-PR setup.
 *   3. `http://localhost:<port>` outside production, so `next dev` always
 *      works with zero configuration.
 *   4. A final hard-coded production domain, for a production build/start
 *      run somewhere that sets neither of the above (e.g. self-hosted).
 *
 * WHY THIS NEEDS TO BE MORE THAN `?? "fallback"`
 * An environment variable that is *set but blank* — a platform dashboard
 * field left empty, or interpolated from another empty variable, both real
 * and common — is a non-null, non-undefined empty string. `??` and `||`
 * never fall through to a default for it, so `new URL("")` throws deep
 * inside whatever first tries to build an absolute URL. Every candidate
 * here is validated with `URL.canParse` before being accepted, so a blank
 * or malformed value is treated exactly like an absent one — skipped, not
 * swallowed — and an invalid `NEXT_PUBLIC_SITE_URL` specifically logs a
 * warning, so a real misconfiguration shows up in the build/deploy log
 * instead of silently becoming an empty string three files away.
 */

/** Used only if neither an explicit override nor Vercel's own URL exists. */
const PRODUCTION_FALLBACK_URL = "https://www.dot-logistics.com";

function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Strips a trailing slash so callers can always do `${url}${path}` safely. */
function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

let cached: string | undefined;

/**
 * Memoized within a process: env vars don't change while the app is
 * running, and Next.js re-evaluates this module import per page during
 * `next build`'s parallel data collection — without this, an invalid
 * `NEXT_PUBLIC_SITE_URL` would log its warning once per page rather than
 * once per process.
 */
export function getSiteUrl(): string {
  if (cached) return cached;
  cached = resolveSiteUrl();
  return cached;
}

function resolveSiteUrl(): string {
  const configured = normalize(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) {
    if (URL.canParse(configured)) {
      return withoutTrailingSlash(configured);
    }
    // Set but not usable — surface it rather than silently discarding it.
    console.warn(
      `[site-url] NEXT_PUBLIC_SITE_URL is set to ${JSON.stringify(configured)}, ` +
        'which is not a valid absolute URL (e.g. "https://example.com"). ' +
        "Ignoring it and falling back to an automatically-detected origin instead.",
    );
  }

  const vercelUrl = normalize(process.env.VERCEL_URL);
  if (vercelUrl) {
    // VERCEL_URL is a bare host (no protocol) on purpose, per Vercel's docs.
    const candidate = `https://${vercelUrl}`;
    if (URL.canParse(candidate)) return candidate;
  }

  if (process.env.NODE_ENV !== "production") {
    const port = normalize(process.env.PORT) ?? "3000";
    return `http://localhost:${port}`;
  }

  return PRODUCTION_FALLBACK_URL;
}
