import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSiteSettings(initialSettings?: Record<string, string>) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings || {});
  const [loading, setLoading] = useState(!initialSettings || Object.keys(initialSettings).length === 0);

  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      return;
    }

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');
        
        if (error) throw error;

        if (data) {
          const settingsMap = data.reduce((acc: any, item: any) => {
            acc[item.key] = item.value;
            return acc;
          }, {});
          setSettings(settingsMap);
        }
      } catch (err: any) {
        // Silently fail if table doesn't exist yet - user needs to run SQL
        if (err?.code !== 'PGRST116') {
          console.warn('Site settings not found or RLS restricted. Using defaults.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [initialSettings]);

  return { settings, loading };
}
