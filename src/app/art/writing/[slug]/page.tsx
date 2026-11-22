import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublicTable } from '@/lib/supabase';
import ArtWritingReader, {
  type CreativeArticleDetail,
} from '@/components/ArtWritingReader';

export const revalidate = 60;

const FALLBACK_CREATIVE_ARTICLES: Record<string, CreativeArticleDetail> = {
  'note-1': {
    id: 'note-1',
    slug: 'note-1',
    title: 'Design Is Subjective, but Clarity Is Not',
    description:
      'Notes on why restraint, clean hierarchy, and visual discipline outlast short-lived trends in digital design.',
    content:
      'Visual taste shifts every season, yet the discipline behind clear communication remains remarkably stable. When a layout removes unnecessary decoration, every remaining choice carries weight.\n\nAcross print magazines, digital archives, and short-form video, clarity comes from knowing what to leave out. Negative space is not empty space; it is the structure that lets typography and photography breathe.\n\nGood creative systems do not compete with the story. They frame it cleanly so the reader can focus on the work itself.',
    coverImage:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'November, 2026',
  },
  'note-2': {
    id: 'note-2',
    slug: 'note-2',
    title: 'Why Regional Newsrooms Need Faster Visual Systems',
    description:
      'Lessons from building repeatable editorial templates for high-velocity daily news across TikTok and YouTube.',
    content:
      'Producing daily news content at scale requires more than speed. Without a unified visual system, rapid publishing quickly turns into fragmented typography, inconsistent framing, and forgettable feeds.\n\nBy building modular editorial templates and disciplined pacing guidelines, a small media production team can publish seven or more pieces daily while maintaining an unmistakable brand presence across platforms.',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'October, 2026',
  },
  'note-3': {
    id: 'note-3',
    slug: 'note-3',
    title: 'From Print Grid to Vertical Video: Keeping Identity Intact',
    description:
      'Translating typography, pacing, and color language from physical print pages to 9:16 mobile screens.',
    content:
      'Print design teaches patience: margins, baseline grids, and ink density force deliberate decisions. Vertical video operates at the opposite tempo, demanding immediate comprehension within the first two seconds.\n\nBridging both mediums means carrying the same typographic clarity and color restraint from paper directly into motion.',
    coverImage:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
    role: 'edited',
    date: 'September, 2026',
  },
  'note-4': {
    id: 'note-4',
    slug: 'note-4',
    title: 'Notes on Documentary Framing and Unhurried Photography',
    description:
      'Observing natural light, architectural shadows, and authentic human rhythm across streets in Makassar.',
    content:
      'Documentary photography works best when the camera stops trying to manufacture drama and starts observing what is already present.\n\nWaiting for light to cross a concrete wall or a quiet gesture to unfold often produces stronger frames than chasing spectacle.',
    coverImage:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'August, 2026',
  },
  'note-5': {
    id: 'note-5',
    slug: 'note-5',
    title: 'Building Editorial Discipline Inside a Student Press',
    description:
      'How structured workflows and data journalism transformed campus storytelling at PK Identitas Unhas.',
    content:
      'Student pressrooms thrive on passion, yet continuity is always the hardest challenge. Establishing shared grid rules, infographic standards, and editorial checklists helps every new cohort produce work that feels cohesive and authoritative.',
    coverImage:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
    role: 'edited',
    date: 'June, 2026',
  },
  'note-6': {
    id: 'note-6',
    slug: 'note-6',
    title: 'Why Restraint Beats Decoration in Industrial Interfaces',
    description:
      'Stripping away visual noise so typography, photography, and functional craft carry the entire experience.',
    content:
      'Industrial design treats every line, gap, and surface as purposeful. When digital interfaces borrow that restraint, they age slower, load faster, and respect the attention of the people using them.',
    coverImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'April, 2026',
  },
};

async function getCreativeArticle(
  slug: string
): Promise<CreativeArticleDetail | null> {
  try {
    const rows = await fetchPublicTable<Record<string, any>>(
      'articles',
      'select=*&order=created_at.desc'
    );
    const match = rows.find(
      (r) => String(r.slug || '') === slug || String(r.id || '') === slug
    );
    if (match) {
      const tagsText = Array.isArray(match.tags)
        ? match.tags.join(' ')
        : String(match.tags || '');
      const roleHaystack =
        `${match.category || ''} ${tagsText} ${match.author || ''}`.toLowerCase();
      const isEdited =
        roleHaystack.includes('edited') ||
        roleHaystack.includes('editor') ||
        roleHaystack.includes('sunting');

      return {
        id: String(match.id),
        slug: String(match.slug || match.id),
        title: String(match.title || 'Untitled'),
        description: match.description ? String(match.description) : undefined,
        content: String(match.content || match.description || ''),
        coverImage: String(
          match.img || match.cover_image || match.image_url || ''
        ).trim(),
        role: isEdited ? 'edited' : 'written',
        date: match.date
          ? String(match.date)
          : match.created_at
          ? new Date(match.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
          : 'November, 2026',
      };
    }
  } catch (e) {
    console.error('Error fetching creative article:', e);
  }

  return FALLBACK_CREATIVE_ARTICLES[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCreativeArticle(slug);
  if (!article) {
    return { title: 'Writing | Adrian (Dri4n)' };
  }
  return {
    title: `${article.title} | Adrian (Dri4n)`,
    description: article.description || article.title,
  };
}

export default async function ArtWritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getCreativeArticle(slug);
  if (!article) {
    notFound();
  }
  return <ArtWritingReader article={article} />;
}
