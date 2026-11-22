import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

let cachedSettings: Record<string, string> | null = null;
let inflightPromise: Promise<Record<string, string>> | null = null;

export function invalidateSiteSettingsCache() {
  cachedSettings = null;
  inflightPromise = null;
}

export function useSiteSettings(initialSettings?: Record<string, string>) {
  const hasInitial = Boolean(
    initialSettings && Object.keys(initialSettings).length > 0
  );

  // Always initialize from SSR initialSettings so first client render matches server HTML (zero hydration mismatch)
  const [settings, setSettings] = useState<Record<string, string>>(
    initialSettings || {}
  );
  const [loading, setLoading] = useState(!hasInitial);

  useEffect(() => {
    let active = true;

    if (cachedSettings && Object.keys(cachedSettings).length > 0) {
      setSettings((prev) => ({ ...prev, ...cachedSettings }));
      setLoading(false);
    }

    async function load() {
      try {
        if (!inflightPromise) {
          inflightPromise = Promise.resolve(
            supabase.from('site_settings').select('key, value')
          )
            .then(({ data, error }) => {
              if (error) throw error;
              const map: Record<string, string> = {};
              if (Array.isArray(data)) {
                for (const item of data) {
                  if (item?.key) map[item.key] = item.value;
                }
              }
              cachedSettings = map;
              return map;
            })
            .finally(() => {
              inflightPromise = null;
            });
        }

        const map = await inflightPromise;
        if (active && Object.keys(map).length > 0) {
          setSettings((prev) => ({ ...prev, ...map }));
        }
      } catch (err: unknown) {
        const code =
          typeof err === 'object' && err !== null && 'code' in err
            ? (err as { code?: string }).code
            : undefined;
        if (code !== 'PGRST116') {
          console.warn('Site settings not found or RLS restricted. Using defaults.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
