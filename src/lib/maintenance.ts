import { isArtHost, isLocalHost } from '@/lib/sites';

/**
 * Global maintenance mode switch for dri4n.com.
 * Active by default. Set `NEXT_PUBLIC_MAINTENANCE_MODE=false` to go live.
 */
export const isMaintenanceMode =
  process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== 'false';

/**
 * Independent maintenance mode switch for art.dri4n.com.
 * Falls back to `isMaintenanceMode` if `NEXT_PUBLIC_ART_MAINTENANCE_MODE` is not set.
 * Set `NEXT_PUBLIC_ART_MAINTENANCE_MODE=false` in Vercel to launch art.dri4n.com independently.
 */
export const isArtMaintenanceMode =
  process.env.NEXT_PUBLIC_ART_MAINTENANCE_MODE !== undefined
    ? process.env.NEXT_PUBLIC_ART_MAINTENANCE_MODE !== 'false'
    : isMaintenanceMode;

export function isMaintenanceModeForHost(host?: string | null): boolean {
  // Never force maintenance mode on local development hosts
  if (isLocalHost(host)) {
    return false;
  }
  if (isArtHost(host)) {
    return isArtMaintenanceMode;
  }
  return isMaintenanceMode;
}

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
