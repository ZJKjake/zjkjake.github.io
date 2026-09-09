/**
 * Join a root-relative path with the configured deploy base path.
 *
 * The site has to work at `/` (GitHub Pages user site, custom domain) and at
 * `/repo-name/` (project repo) from the same source, so every internal href
 * and asset URL goes through here rather than being hardcoded.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}` || '/';
}
