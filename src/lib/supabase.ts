import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.dri4n.com'
  ).trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // Use stateless @supabase/supabase-js client on Server Components / Route Handlers
  // (createBrowserClient relies on browser cookies/storage and breaks SSR fetches on Vercel)
  if (typeof window === 'undefined') {
    return createSupabaseClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return createBrowserClient(url, anonKey);
};

// Keep a static instance for backward compatibility where needed
export const supabase = createClient();
