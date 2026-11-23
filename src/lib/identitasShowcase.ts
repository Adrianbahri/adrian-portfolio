export type IdentitasModeKey = 'videos' | 'design' | 'documenter';

export interface IdentitasVideoItem {
  id: string;
  title: string;
  mediaUrl: string; // direct .mp4/.webm/.mov, YouTube URL, or poster image
}

export interface IdentitasDesignItem {
  id: string;
  title: string;
  tags: string[];
  narrative: string;
  image: string;
  extraImages?: string[];
}

export interface IdentitasDocItem {
  id: string;
  title: string;
  youtubeUrl: string;
}

export interface IdentitasShowcaseConfig {
  title: string;
  description: string;
  videos: IdentitasVideoItem[];
  designs: IdentitasDesignItem[];
  documenters: IdentitasDocItem[];
}

export function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

export function toYouTubeEmbedUrl(
  url: string | undefined | null,
  opts?: { autoplay?: boolean; mute?: boolean; loop?: boolean }
): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });
  if (opts?.autoplay) params.set('autoplay', '1');
  if (opts?.mute) params.set('mute', '1');
  if (opts?.loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export const DEFAULT_IDENTITAS_SHOWCASE: IdentitasShowcaseConfig = {
  title: 'Identitas Unhas',
  description:
    'Visual journalism, editorial infographics, short-form reels, and campus documentary production for PK Identitas Universitas Hasanuddin. Built consistent visual systems across print, social feeds, and video.',
  videos: [
    {
      id: 'id-vid-1',
      title: 'Pilrek Unhas Coverage Reel',
      mediaUrl:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'id-vid-2',
      title: 'SNBP & SNBT Data Breakdown',
      mediaUrl:
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'id-vid-3',
      title: 'Campus Field Report',
      mediaUrl:
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'id-vid-4',
      title: 'Editorial Motion Bumper',
      mediaUrl:
        'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=900&q=85',
    },
  ],
  designs: [
    {
      id: 'id-des-1',
      title: 'SNBP Unhas 2026 Infographic',
      tags: ['INFOGRAPHIC', 'EDITORIAL'],
      narrative:
        'Data journalism carousel breaking down SNBP admission ratios and faculty competition at Universitas Hasanuddin.\n\nDesigned with strict Swiss typographic hierarchy so dense academic numbers stay scannable on mobile feeds.',
      image:
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
      ],
    },
    {
      id: 'id-des-2',
      title: 'Pilrek Unhas Special Edition',
      tags: ['BRANDING', 'EDITORIAL'],
      narrative:
        'Visual coverage system for the Universitas Hasanuddin Rector Election, spanning candidate profiles, timeline carousels, and live result graphics.',
      image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
      ],
    },
    {
      id: 'id-des-3',
      title: 'Majalah Kampus Cover System',
      tags: ['PRINT', 'LAYOUT'],
      narrative:
        'Print magazine cover and interior grid system for PK Identitas Unhas, balancing bold editorial headlines with documentary photography.',
      image:
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85',
      ],
    },
    {
      id: 'id-des-4',
      title: 'Data Journalism Carousel',
      tags: ['DATA', 'SOCIAL'],
      narrative:
        'Modular 4:5 carousel templates engineered for rapid campus newsroom turnaround without sacrificing visual discipline.',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
      ],
    },
  ],
  documenters: [
    {
      id: 'id-doc-1',
      title: 'Dokumenter Kampus Unhas Vol. 01',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: 'id-doc-2',
      title: 'Liputan Khusus Mahasiswa Makassar',
      youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    },
    {
      id: 'id-doc-3',
      title: 'Arsip Jurnalistik Identitas',
      youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    },
    {
      id: 'id-doc-4',
      title: 'Feature Dokumenter Lapangan',
      youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    },
  ],
};

export function mapDesignThemesToIdentitasDesigns(
  rows: Array<{
    id?: string | number;
    title?: string | null;
    description?: string | null;
    images?: string[] | null;
  }>
): IdentitasDesignItem[] {
  return rows
    .filter((r) => Boolean(r.title) && Array.isArray(r.images) && r.images.length > 0)
    .map((r, idx) => {
      const imgs = (r.images || []).filter(Boolean);
      const cleanNarrative = String(r.description || '')
        .replace(/\[PDF:\s*.*?\]/g, '')
        .trim();
      return {
        id: `dt-${r.id || idx}`,
        title: String(r.title || `Design ${idx + 1}`).trim(),
        tags: ['DESIGN', 'IDENTITAS UNHAS'],
        narrative:
          cleanNarrative ||
          'Editorial visual design and carousel series produced for PK Identitas Universitas Hasanuddin.',
        image: imgs[0],
        extraImages: imgs.slice(1),
      };
    });
}

export function mapVideoWorksToIdentitasDocs(
  rows: Array<{
    id?: string | number;
    title?: string | null;
    video_url?: string | null;
  }>
): IdentitasDocItem[] {
  return rows
    .filter((r) => Boolean(r.title) && Boolean(r.video_url))
    .map((r, idx) => ({
      id: `vw-${r.id || idx}`,
      title: String(r.title || `Dokumenter ${idx + 1}`).trim(),
      youtubeUrl: String(r.video_url || '').trim(),
    }));
}

const DEFAULT_DESIGN_IDS = new Set(
  DEFAULT_IDENTITAS_SHOWCASE.designs.map((d) => d.id)
);
const DEFAULT_DOC_IDS = new Set(
  DEFAULT_IDENTITAS_SHOWCASE.documenters.map((d) => d.id)
);

export function isDefaultMockDesigns(items: IdentitasDesignItem[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return true;
  return items.every(
    (item) =>
      DEFAULT_DESIGN_IDS.has(item.id) &&
      String(item.image || '').includes('images.unsplash.com')
  );
}

export function isDefaultMockDocs(items: IdentitasDocItem[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return true;
  return items.every(
    (item) =>
      DEFAULT_DOC_IDS.has(item.id) &&
      DEFAULT_IDENTITAS_SHOWCASE.documenters.some(
        (def) => def.id === item.id && def.youtubeUrl === item.youtubeUrl
      )
  );
}

export function parseIdentitasShowcase(
  rawJson: string | undefined | null
): IdentitasShowcaseConfig {
  if (!rawJson) return DEFAULT_IDENTITAS_SHOWCASE;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && typeof parsed === 'object') {
      return {
        title:
          String(parsed.title || '').trim() || DEFAULT_IDENTITAS_SHOWCASE.title,
        description:
          String(parsed.description || '').trim() ||
          DEFAULT_IDENTITAS_SHOWCASE.description,
        videos:
          Array.isArray(parsed.videos) && parsed.videos.length > 0
            ? parsed.videos
            : DEFAULT_IDENTITAS_SHOWCASE.videos,
        designs:
          Array.isArray(parsed.designs) && parsed.designs.length > 0
            ? parsed.designs
            : DEFAULT_IDENTITAS_SHOWCASE.designs,
        documenters:
          Array.isArray(parsed.documenters) && parsed.documenters.length > 0
            ? parsed.documenters
            : DEFAULT_IDENTITAS_SHOWCASE.documenters,
      };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_IDENTITAS_SHOWCASE;
}
