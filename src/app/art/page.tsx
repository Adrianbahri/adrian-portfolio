import { fetchPublicTable } from '@/lib/supabase';
import ArtSiteView from '@/components/ArtSiteView';

export const revalidate = 60;

export default async function ArtHomePage() {
  let initialSettings: Record<string, string> = {};

  try {
    const rows = await fetchPublicTable<{ key: string; value: string }>(
      'site_settings',
      'select=key,value'
    );
    if (rows.length > 0) {
      initialSettings = rows.reduce(
        (acc: Record<string, string>, item) => {
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
