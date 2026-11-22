import type { Metadata } from 'next';
import { fetchPublicTable } from '@/lib/supabase';
import ArtAboutView, {
  type ArtAboutExperience,
} from '@/components/ArtAboutView';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About | Adrian (Dri4n) Creative Archive',
  description:
    'About Adrian (Dri4n), Creative Technologist, Visual Designer, and Media Producer based in Makassar, Indonesia.',
  alternates: {
    canonical: '/art/about',
  },
};

export default async function ArtAboutPage() {
  let initialSettings: Record<string, string> = {};
  let initialExperiences: ArtAboutExperience[] = [];

  try {
    const [settingsRows, expRows] = await Promise.all([
      fetchPublicTable<{ key: string; value: string }>(
        'site_settings',
        'select=key,value'
      ),
      fetchPublicTable<Record<string, any>>(
        'experiences',
        'select=*&order=created_at.desc'
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

    if (expRows.length > 0) {
      initialExperiences = expRows.map((row, idx) => ({
        id: String(row.id || `exp-${idx}`),
        company: String(row.company || row.organization || '').trim(),
        role: String(row.role || row.position || row.title || '').trim(),
        period: String(row.period || row.duration || row.year || '').trim(),
        description: row.description ? String(row.description).trim() : null,
      }));
    }
  } catch (e) {
    console.error('Error fetching SSR data for /art/about:', e);
  }

  return (
    <ArtAboutView
      initialSettings={initialSettings}
      initialExperiences={initialExperiences}
    />
  );
}
