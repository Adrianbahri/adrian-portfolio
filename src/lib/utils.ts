import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Triggers on-demand Next.js cache revalidation for the entire portal.
 */
export async function purgeSystemCache() {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      console.log('⚡ [System Cache] Revalidated and purged successfully!');
    } else {
      console.error('⚠️ [System Cache] Revalidation response not OK');
    }
  } catch (err) {
    console.error('❌ [System Cache] Failed to trigger revalidation:', err);
  }
}
