import { supabase } from '@/lib/supabase';
import ArtSiteView from '@/components/ArtSiteView';

export default async function ArtHomePage() {
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
    console.error('Error fetching site settings for dri4n.com/art:', e);
  }

  return (
    <>
      <ArtSiteView initialSettings={initialSettings} />

      <section
        className="sr-only"
        aria-label="Arsip Kreatif Adrian Bahri (Dri4n) — Teknik Informatika Universitas Hasanuddin (Unhas)"
      >
        <h2>
          ©Adrian Bahri (Dri4n) — Creative Side, Visual Design, Photography
          &amp; Motion Archive (Universitas Hasanuddin / Unhas Makassar)
        </h2>
        <p>
          Halaman Creative Side dari Adrian Bahri (Adrian Unhas / Adrian Teknik
          Informatika Universitas Hasanuddin), menampilkan portofolio desain
          visual, identitas brand, desain editorial majalah kampus PK Identitas
          Unhas, fotografi dokumenter, dan produksi video/motion di Makassar.
        </p>
      </section>
    </>
  );
}
