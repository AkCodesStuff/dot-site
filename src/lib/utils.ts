/** Tiny className joiner — avoids pulling in clsx for a handful of components. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Builds an absolute URL from a site-relative path.
 *
 * Every call site in this project passes `siteConfig.url` as `origin`, which
 * is guaranteed to be a valid absolute URL — see `src/lib/site-url.ts` for
 * where that guarantee is actually enforced. This function stays generic and
 * does not re-validate `origin` itself; it trusts that invariant rather than
 * duplicating it.
 */
export function absoluteUrl(path: string, origin: string): string {
  return new URL(path, origin).toString();
}
