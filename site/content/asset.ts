/**
 * Public asset URL builder.
 *
 * In production builds deployed under a subpath (e.g. GitHub Pages at
 * /my-career), `NEXT_PUBLIC_BASE_PATH` is set to `/my-career` and all
 * absolute paths in the content (e.g. `/photo.jfif`, `/screenshots/...`)
 * are rewritten to include the prefix.
 *
 * In local dev, the prefix is empty so `/photo.jfif` still works.
 */
const PREFIX =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_PATH) || "";

export function asset(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) return path;
  return `${PREFIX}${path}`;
}
