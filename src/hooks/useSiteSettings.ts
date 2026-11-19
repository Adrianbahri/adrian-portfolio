import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

let cachedSettings: Record<string, string> | null = null;
let inflightPromise: Promise<Record<string, string>> | null = null;

export function useSiteSettings(initialSettings?: Record<string, string>) {
  const hasInitial = Boolean(
    initialSettings && Object.keys(initialSettings).length > 0
  );
  if (hasInitial && !cachedSettings && initialSettings) {
    cachedSettings = initialSettings;
  }

  const [settings, setSettings] = useState<Record<string, string>>(
    cachedSettings || initialSettings || {}
  );
  const [loading, setLoading] = useState(!cachedSettings && !hasInitial);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let active = true;

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
        if (active) setSettings(map);
      } catch (err: any) {
        if (err?.code !== 'PGRST116') {
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
