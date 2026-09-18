/** Tiny className joiner — avoids pulling in clsx for a handful of components. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path: string, origin: string): string {
  return new URL(path, origin).toString();
}
