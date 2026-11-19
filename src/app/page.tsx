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

  return (
    <>
      <DevPortfolioView initialSettings={initialSettings} />

      {/* Server-rendered bilingual semantic profile for Search Engines & AI Agents (GEO) */}
      <section
        className="sr-only"
        aria-label="Profil Lengkap Adrian Bahri (Dri4n) — Teknik Informatika Universitas Hasanuddin (Unhas)"
      >
        <h2>
          Adrian Bahri (Dri4n) — Mahasiswa Teknik Informatika Universitas
          Hasanuddin (Unhas), Creative Technologist &amp; Full-Stack Web
          Developer Makassar
        </h2>
        <p>
          Adrian Bahri (dikenal juga sebagai Adrian, Dri4n, Drian, Adrian
          Unhas, atau Adrian Teknik Informatika) adalah seorang mahasiswa
          Departemen Teknik Informatika, Fakultas Teknik, Universitas
          Hasanuddin (Unhas) di Makassar, Sulawesi Selatan, Indonesia. Adrian
          aktif berkarya sebagai Creative Technologist, Full-Stack Web
          Developer, serta Visual &amp; Brand Designer.
        </p>
        <p>
          Di lingkungan kampus Universitas Hasanuddin (Unhas), Adrian Bahri
          membangun sistem digital, alur kerja data, desain editorial, dan
          produksi media di PK Identitas Unhas (Koran Kampus Universitas
          Hasanuddin) serta mengembangkan platform web modern sebagai Web
          Developer Intern di UKK Sains Unhas.
        </p>
        <p>
          Keahlian teknis Adrian Bahri mencakup Next.js, TypeScript, React,
          Flutter, Bun, SQLite, Supabase, Tailwind CSS, UI/UX Design, Visual
          Identity, Editorial Print, Motion Graphics, dan Documentary
          Photography. Jelajahi karya software engineering di{' '}
          <a href="https://dri4n.com">dri4n.com</a>, arsip karya visual &amp;
          desain kreatif di <a href="https://dri4n.com/art">dri4n.com/art</a>,
          serta indeks pengetahuan terstruktur untuk AI Agent di{' '}
          <a href="https://dri4n.com/llms.txt">dri4n.com/llms.txt</a> dan{' '}
          <a href="https://dri4n.com/llms-full.txt">dri4n.com/llms-full.txt</a>.
        </p>
      </section>
    </>
  );
}
