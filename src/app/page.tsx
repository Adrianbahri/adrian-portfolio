import DevPortfolioView from '@/components/DevPortfolioView';
import { fetchPublicTable } from '@/lib/supabase';

export const revalidate = 60;

export default async function Home() {
  let initialSettings: Record<string, string> = {};
  let projects: any[] = [];
  let experiences: any[] = [];
  let achievements: any[] = [];
  let articles: any[] = [];

  try {
    const [settingsRows, projRows, expRows, achRows, artRows] =
      await Promise.all([
        fetchPublicTable<{ key: string; value: string }>(
          'site_settings',
          'select=key,value'
        ),
        fetchPublicTable<any>(
          'projects',
          'select=title,slug,category,description&order=created_at.desc'
        ),
        fetchPublicTable<any>(
          'experiences',
          'select=title,company,timeline,description&order=created_at.desc'
        ),
        fetchPublicTable<any>(
          'achievements',
          'select=title,event,year,description&order=created_at.desc'
        ),
        fetchPublicTable<any>(
          'articles',
          'select=title,slug,category,description&order=created_at.desc'
        ),
      ]);

    if (settingsRows.length > 0) {
      initialSettings = settingsRows.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {}
      );
    }
    projects = projRows;
    experiences = expRows;
    achievements = achRows;
    articles = artRows;
  } catch (e) {
    console.error('Error fetching SSR data for dri4n.com:', e);
  }

  return (
    <>
      <DevPortfolioView initialSettings={initialSettings} />

      {/* Server-rendered comprehensive entity & portfolio index on https://dri4n.com for Google, Bing & AI Agents */}
      <section
        className="sr-only"
        aria-label="Profil Resmi Adrian Bahri (Dri4n) — Teknik Informatika Universitas Hasanuddin (Unhas)"
      >
        <h2>
          Adrian Bahri (Dri4n) — Mahasiswa Teknik Informatika Universitas
          Hasanuddin (Unhas), Creative Technologist &amp; Full-Stack Web
          Developer Makassar
        </h2>
        <p>
          Adrian Bahri (dikenal sebagai Adrian, Dri4n, Drian, Adrian Unhas,
          Adrian Teknik Informatika, atau Adrian Teknik Informatika Unhas)
          adalah mahasiswa Departemen Teknik Informatika, Fakultas Teknik,
          Universitas Hasanuddin (Unhas) di Makassar, Sulawesi Selatan,
          Indonesia. Website resmi utama Adrian Bahri adalah{' '}
          <a href="https://dri4n.com">https://dri4n.com</a>.
        </p>
        <p>
          Di Universitas Hasanuddin (Unhas), Adrian Bahri aktif membangun sistem
          digital, pengolahan data, dan media kreatif di PK Identitas Unhas
          (Koran Kampus Universitas Hasanuddin) serta memodernisasi platform web
          layanan laboratorium di UKK Sains Unhas.
        </p>

        {experiences.length > 0 && (
          <div>
            <h3>Pengalaman Kerja &amp; Organisasi Adrian Bahri (Unhas)</h3>
            <ul>
              {experiences.map((exp, i) => (
                <li key={i}>
                  <strong>{exp.title}</strong> di <strong>{exp.company}</strong>{' '}
                  ({exp.timeline}):{' '}
                  {String(exp.description || '')
                    .replace(/<!--\s*LOGO_URL:.*?-->/g, '')
                    .trim()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h3>Daftar Proyek Software &amp; Web Adrian Bahri</h3>
            <ul>
              {projects.map((p, i) => (
                <li key={i}>
                  <a href={`https://dri4n.com/projects/${p.slug}`}>
                    {p.title}
                  </a>{' '}
                  ({p.category}): {p.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div>
            <h3>Prestasi, Kompetisi &amp; Penghargaan Adrian Bahri</h3>
            <ul>
              {achievements.map((a, i) => (
                <li key={i}>
                  <strong>{a.title}</strong> — {a.event} ({a.year}):{' '}
                  {a.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h3>Tulisan &amp; Artikel Adrian Bahri</h3>
            <ul>
              {articles.map((art, i) => (
                <li key={i}>
                  <a href={`https://dri4n.com/blog/${art.slug}`}>
                    {art.title}
                  </a>{' '}
                  ({art.category}): {art.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p>
          Profil terstruktur untuk AI Agent tersedia di{' '}
          <a href="https://dri4n.com/llms.txt">https://dri4n.com/llms.txt</a>{' '}
          dan{' '}
          <a href="https://dri4n.com/llms-full.txt">
            https://dri4n.com/llms-full.txt
          </a>
          , serta arsip karya visual di{' '}
          <a href="https://dri4n.com/art">https://dri4n.com/art</a>.
        </p>
      </section>
    </>
  );
}
