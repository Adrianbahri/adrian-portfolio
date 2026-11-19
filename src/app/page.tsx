import DevPortfolioView from '@/components/DevPortfolioView';
import { supabase } from '@/lib/supabase';

export default async function Home() {
  let initialSettings: Record<string, string> = {};

  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      initialSettings = data.reduce(
        (acc: Record<string, string>, item: { key: string; value: string }) => {
          acc[item.key] = item.value;
          return acc;
        },
        {}
      );
    }
  } catch (e) {
    console.error('Error fetching site settings server-side:', e);
  }

  return <DevPortfolioView initialSettings={initialSettings} />;
}
