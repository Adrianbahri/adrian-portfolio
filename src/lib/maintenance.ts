/**
 * Global maintenance mode switch for dri4n.com.
 *
 * Active by default so deployments serve the Under Maintenance experience.
 * To restore the full portfolio, set `NEXT_PUBLIC_MAINTENANCE_MODE=false`
 * in your environment variables (e.g. Vercel) or change the default below.
 */
export const isMaintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== 'false';

/**
 * Paths that remain accessible while maintenance mode is enabled.
 */
export const MAINTENANCE_BYPASS_PREFIXES = [
  '/maintenance',
  '/admin',
  '/login',
  '/reset-password',
  '/api',
  '/_next',
];

export const MAINTENANCE_BYPASS_EXACT = new Set([
  '/favicon.ico',
  '/favicon.png',
  '/icon.png',
  '/opengraph-image',
  '/opengraph-image.png',
  '/robots.txt',
  '/sitemap.xml',
  '/noise.svg',
]);

export function shouldBypassMaintenance(pathname: string): boolean {
  if (MAINTENANCE_BYPASS_EXACT.has(pathname)) return true;
  if (MAINTENANCE_BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  // Allow static asset files (images, fonts, pdfs, icons, etc.)
  if (/\.(?:ico|png|jpg|jpeg|webp|svg|gif|avif|woff2?|ttf|otf|css|js|map|pdf|txt|xml|json)$/i.test(pathname)) {
    return true;
  }
  return false;
}
