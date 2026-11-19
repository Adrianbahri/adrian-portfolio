export const PRIMARY_DOMAIN = 'dri4n.com';
export const ART_DOMAIN = 'art.dri4n.com';
export const ART_PATH = '/art';

export const PRIMARY_SITE_URL = `https://${PRIMARY_DOMAIN}`;
export const ART_SITE_URL = `https://${PRIMARY_DOMAIN}${ART_PATH}`;

/**
 * Normalize a Host header (strip port and lowercase).
 */
export function normalizeHost(host?: string | null): string {
  if (!host) return '';
  return host.split(':')[0].trim().toLowerCase();
}

/**
 * Detect whether a host is a local development address.
 */
export function isLocalHost(host?: string | null): boolean {
  const normalized = normalizeHost(host);
  if (!normalized) return false;
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized.endsWith('.localhost') ||
    normalized.startsWith('192.168.')
  );
}

/**
 * Detect whether a request or browser host belongs to the Creative microsite (art.dri4n.com).
 * Also supports `art.localhost` for local development testing.
 */
export function isArtHost(host?: string | null): boolean {
  const normalized = normalizeHost(host);
  if (!normalized) return false;

  const customArtHost = normalizeHost(process.env.NEXT_PUBLIC_ART_HOST);
  if (customArtHost && normalized === customArtHost) {
    return true;
  }

  return (
    normalized === ART_DOMAIN ||
    normalized === `www.${ART_DOMAIN}` ||
    normalized === 'art.localhost' ||
    normalized.startsWith('art.')
  );
}
