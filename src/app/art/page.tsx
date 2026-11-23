import { fetchPublicTable } from '@/lib/supabase';
import { parseGalleryMeta } from '@/lib/galleryMeta';
import {
  mapDesignThemesToIdentitasDesigns,
  mapVideoWorksToIdentitasDocs,
  type IdentitasDesignItem,
  type IdentitasDocItem,
} from '@/lib/identitasShowcase';
import ArtSiteView, {
  type ArtWritingItem,
  type IndustrialPhotoItem,
} from '@/components/ArtSiteView';

export const revalidate = 60;

export default async function ArtHomePage() {
  let initialSettings: Record<string, string> = {};
  let initialPhotos: IndustrialPhotoItem[] = [];
  let initialArticles: ArtWritingItem[] = [];
  let initialIdentitasDesigns: IdentitasDesignItem[] = [];
  let initialIdentitasDocs: IdentitasDocItem[] = [];

  try {
    const [
      settingsRows,
      galleryRows,
      articleRows,
      designThemeRows,
      videoWorkRows,
    ] = await Promise.all([
      fetchPublicTable<{ key: string; value: string }>(
        'site_settings',
        'select=key,value'
      ),
      fetchPublicTable<{
        id: string | number;
        title?: string | null;
        caption?: string | null;
        image_url?: string | null;
        created_at?: string | null;
      }>('gallery', 'select=*&order=created_at.desc'),
      fetchPublicTable<{
        id: string | number;
        slug?: string | null;
        title?: string | null;
        description?: string | null;
        excerpt?: string | null;
        content?: string | null;
        category?: string | null;
        author?: string | null;
        tags?: string[] | string | null;
        img?: string | null;
        cover_image?: string | null;
        image_url?: string | null;
        created_at?: string | null;
      }>('articles', 'select=*&order=created_at.desc'),
      fetchPublicTable<{
        id: string | number;
        title?: string | null;
        description?: string | null;
        images?: string[] | null;
      }>('design_themes', 'select=*&order=created_at.desc'),
      fetchPublicTable<{
        id: string | number;
        title?: string | null;
        video_url?: string | null;
      }>('video_works', 'select=*&order=created_at.desc'),
    ]);

    if (designThemeRows.length > 0) {
      initialIdentitasDesigns =
        mapDesignThemesToIdentitasDesigns(designThemeRows);
    }

    if (videoWorkRows.length > 0) {
      initialIdentitasDocs = mapVideoWorksToIdentitasDocs(videoWorkRows);
    }

    if (settingsRows.length > 0) {
      initialSettings = settingsRows.reduce(
        (acc: Record<string, string>, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {}
      );
    }

    if (galleryRows.length > 0) {
      initialPhotos = galleryRows
        .filter((g) => Boolean(g.image_url))
        .map((g, idx) => {
          const meta = parseGalleryMeta(g.title, g.caption, idx);
          return {
            id: `photo-${g.id || idx}`,
            title: meta.title,
            tags: meta.tags,
            caption: meta.narrative,
            image: String(g.image_url),
            extraImages: meta.images,
            date: g.created_at
              ? new Date(g.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '2026',
          };
        });
    }

    if (articleRows.length > 0) {
      initialArticles = articleRows
        .filter((a) => {
          if (!a.title) return false;
          const tagsText = Array.isArray(a.tags)
            ? a.tags.join(' ')
            : String(a.tags || '');
          const hay = `${a.category || ''} ${tagsText}`.toLowerCase();
          return hay.includes('creative');
        })
        .map((a, idx) => {
          const rawBody = String(a.description || a.excerpt || a.content || '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/[#*_>`~[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          const excerpt =
            rawBody.length > 145
              ? `${rawBody.slice(0, 142).trim()}...`
              : rawBody;
          const tagsText = Array.isArray(a.tags)
            ? a.tags.join(' ')
            : String(a.tags || '');
          const roleHaystack =
            `${a.category || ''} ${tagsText} ${a.author || ''}`.toLowerCase();
          const isEdited =
            roleHaystack.includes('edited') ||
            roleHaystack.includes('editor') ||
            roleHaystack.includes('sunting');
          return {
            id: String(a.id || `art-note-${idx}`),
            slug: a.slug ? String(a.slug) : String(a.id || ''),
            title: String(a.title),
            excerpt,
            coverImage: String(
              a.img || a.cover_image || a.image_url || ''
            ).trim(),
            role: isEdited ? 'edited' : 'written',
            date: a.created_at
              ? new Date(a.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })
              : 'November, 2026',
          };
        });
    }
  } catch (e) {
    console.error('Error fetching SSR data for dri4n.com/art:', e);
  }

  return (
    <>
      <ArtSiteView
        initialSettings={initialSettings}
        initialPhotos={initialPhotos}
        initialArticles={initialArticles}
        initialIdentitasDesigns={initialIdentitasDesigns}
        initialIdentitasDocs={initialIdentitasDocs}
      />

      <section
        className="sr-only"
        aria-label="Arsip Kreatif Adrian (Dri4n) — Teknik Informatika Universitas Hasanuddin (Unhas)"
      >
        <h2>
          ©Adrian (Dri4n) — Creative Side, Visual Design, Photography
          &amp; Motion Archive (Universitas Hasanuddin / Unhas Makassar)
        </h2>
        <p>
          Halaman Creative Side dari Adrian (Adrian Unhas / Adrian Teknik
          Informatika Universitas Hasanuddin), menampilkan portofolio desain
          visual, identitas brand, desain editorial majalah kampus PK Identitas
          Unhas, fotografi dokumenter, dan produksi video/motion di Makassar.
        </p>
      </section>
    </>
  );
}
