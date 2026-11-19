import { supabase } from '@/lib/supabase';
import ArtSiteView from '@/components/ArtSiteView';

export default async function ArtHomePage() {
  let initialSettings: Record<string, string> = {};

  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      initialSettings = data.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
    }
  } catch (e) {
    console.error('Error fetching site settings for art.dri4n.com:', e);
  }

  return <ArtSiteView initialSettings={initialSettings} />;
}
