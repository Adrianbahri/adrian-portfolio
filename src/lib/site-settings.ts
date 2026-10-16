import { cache } from 'react';
import { supabase } from '@/lib/supabase';

// Share the same CMS settings between the page and its metadata in one render.
export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return {};
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error || !data) return {};
    return Object.fromEntries(data.map(({ key, value }) => [key, value]));
  } catch {
    return {};
  }
});
