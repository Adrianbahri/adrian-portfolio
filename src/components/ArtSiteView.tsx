'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { workData as staticWorkData } from '@/data/experience';
import { techStack } from '@/data/techstack';
import { runThemeTransition } from '@/lib/themeTransition';
import { navigateWithCirclePortal } from '@/lib/portalTransition';
import { ArtCursor } from '@/components/ArtCursor';
import '@/styles/shahriyar.css';

type ArtTab = 'archive' | 'design' | 'video' | 'photo' | 'about';

interface ArtWorkItem {
  id: string;
  title: string;
  disciplines: string[];
  category: 'design' | 'print' | 'motion' | 'photo';
  cover: string;
  images: string[];
  description: string;
  year?: string;
  href?: string;
  pdfUrl?: string;
  credits?: string;
  videoFormat?: '16:9' | '9:16';
}

interface ArchiveTile {
  id: string;
  title: string;
  image: string;
  linkedWorkId?: string;
  category: string;
}

interface ExpRow {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

const FALLBACK_WORKS: ArtWorkItem[] = [
  {
    id: 'fallback-posters',
    title: 'Visual Identity & Posters',
    disciplines: ['BRANDING', 'TYPOGRAPHY'],
    category: 'design',
    cover:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Exploration of bold typography, poster compositions, and minimal brand identity systems crafted for digital and physical media.',
    year: '2026',
  },
  {
    id: 'fallback-editorial',
    title: 'Identity Unhas Editorial',
    disciplines: ['EDITORIAL', 'PRINT DESIGN'],
    category: 'print',
    cover:
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Publication layout, art direction, and visual branding crafted for campus journalism media.',
    year: '2025',
  },
  {
    id: 'fallback-motion',
    title: 'Cinematic Reels & Motion',
    disciplines: ['MOTION', 'COLOR GRADING'],
    category: 'motion',
    cover:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Visual pacing, color grading, and motion graphics for digital storytelling.',
    year: '2025',
  },
  {
    id: 'fallback-photo',
    title: 'Makassar Street & Frames',
    disciplines: ['PHOTOGRAPHY', 'DOCUMENTARY'],
    category: 'photo',
    cover:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80',
    images: [
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    ],
    description:
      'Candid moments, architectural light, and documentary frames captured on the move.',
    year: '2025',
  },
];

const FALLBACK_ARCHIVE: ArchiveTile[] = [
  {
    id: 'arc-1',
    title: 'Visual Study 01',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
    category: 'Design',
  },
  {
    id: 'arc-2',
    title: 'Editorial Spread',
    image:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
    category: 'Print',
  },
  {
    id: 'arc-3',
    title: 'Color Grade Frame',
    image:
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=900&q=80',
    category: 'Motion',
  },
  {
    id: 'arc-4',
    title: 'Golden Hour Shot',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    category: 'Photo',
  },
  {
    id: 'arc-5',
    title: 'Grid Exploration',
    image:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=900&q=80',
    category: 'Design',
  },
  {
    id: 'arc-6',
    title: 'Studio Frame',
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    category: 'Photo',
  },
];

function isImageUrl(url?: string | null) {
  if (!url) return false;
  return /\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(url);
}

function getYoutubeId(url?: string | null) {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/
  );
  return m ? m[1] : null;
}

function isDirectVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

export default function ArtSiteView({
  initialSettings,
}: {
  initialSettings?: Record<string, string>;
}) {
  const router = useRouter();
  const { settings } = useSiteSettings(initialSettings);

  // Synced Light & Dark Theme (Default Light like Gaurav Mishra, switches cleanly with circular reveal!)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<ArtTab>('archive');
  const [selectedWork, setSelectedWork] = useState<ArtWorkItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ArchiveTile | null>(null);
  const [works, setWorks] = useState<ArtWorkItem[]>(FALLBACK_WORKS);
  const [archiveTiles, setArchiveTiles] =
    useState<ArchiveTile[]>(FALLBACK_ARCHIVE);
  const [photoTiles, setPhotoTiles] = useState<ArchiveTile[]>(
    FALLBACK_ARCHIVE.filter((a) => a.category === 'Photo')
  );
  const [experiences, setExperiences] = useState<ExpRow[]>(() =>
    staticWorkData.map((w, i) => ({
      id: `static-exp-${i}`,
      company: w.company,
      role: w.role,
      period: w.year,
      description: w.desc,
    }))
  );
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [slotTicks, setSlotTicks] = useState<[number, number, number, number, number]>([
    0, 0, 0, 0, 0,
  ]);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const creativeTools = useMemo(
    () => techStack.filter((t) => t.mode === 'creative'),
    []
  );

  // Staggered cover slideshow for Archive: 3 Design slots (0,1,2) + 2 Photo slots (3,4)
  useEffect(() => {
    if (activeTab !== 'archive' || selectedWork) return;
    let step = 0;
    const id = window.setInterval(() => {
      const targetSlot = step % 5;
      step += 1;
      if (hoveredSlot === targetSlot) return;
      setSlotTicks((prev) => {
        const next: [number, number, number, number, number] = [...prev];
        next[targetSlot] += 1;
        return next;
      });
    }, 1250);
    return () => window.clearInterval(id);
  }, [activeTab, selectedWork, hoveredSlot]);

  // Sync saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  // Sync hash (#archive, #design, #video, #photo, #about)
  useEffect(() => {
    const syncHash = () => {
      const h = window.location.hash.replace('#', '').toLowerCase();
      if (
        h === 'archive' ||
        h === 'design' ||
        h === 'video' ||
        h === 'photo' ||
        h === 'about'
      ) {
        setActiveTab(h);
        setSelectedWork(null);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Escape closes project case study or lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWork) setSelectedWork(null);
        else if (lightboxImage) setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedWork, lightboxImage]);

  const switchTheme = (
    next: 'light' | 'dark',
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (next === theme) return;
    runThemeTransition(() => {
      setTheme(next);
      localStorage.setItem('theme', next);
      if (next === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }, e);
  };

  const selectTab = (tab: ArtTab) => {
    setSelectedWork(null);
    setActiveTab(tab);
    window.history.replaceState(null, '', tab === 'archive' ? '/art' : `/art#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markImageBroken = (src: string) => {
    setBrokenImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  // Load Adrian's live data from Supabase
  useEffect(() => {
    async function loadArtData() {
      try {
        const [
          designsRes,
          magazinesRes,
          videosRes,
          galleryRes,
          projectsRes,
          expRes,
        ] = await Promise.all([
          supabase
            .from('design_themes')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('magazines')
            .select('*')
            .order('order_index', { ascending: true }),
          supabase
            .from('video_works')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(18),
          supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('experiences')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

        const collectedWorks: ArtWorkItem[] = [];
        const collectedArchive: ArchiveTile[] = [];

        if (designsRes.data?.length) {
          for (const d of designsRes.data) {
            const imgs: string[] = Array.isArray(d.images)
              ? d.images.filter(Boolean)
              : [];
            if (imgs.length === 0) continue;
            const id = `design-${d.id}`;
            const isPrint =
              typeof d.description === 'string' &&
              d.description.includes('[CAT: Print]');
            collectedWorks.push({
              id,
              title: d.title || 'Visual Design',
              disciplines: isPrint
                ? ['EDITORIAL', 'PRINT']
                : ['BRANDING', 'VISUAL DESIGN'],
              category: isPrint ? 'print' : 'design',
              cover: imgs[0],
              images: imgs,
              description: (d.description || '')
                .replace('[CAT: Print]', '')
                .trim(),
              year: d.created_at
                ? String(new Date(d.created_at).getFullYear())
                : '2025',
            });
            collectedArchive.push({
              id: `arc-${id}`,
              title: d.title || 'Visual Design',
              image: imgs[0],
              linkedWorkId: id,
              category: isPrint ? 'Print' : 'Design',
            });
          }
        }

        if (magazinesRes.data?.length) {
          for (const m of magazinesRes.data) {
            const cover = isImageUrl(m.pdf_url)
              ? m.pdf_url
              : FALLBACK_WORKS[1].cover;
            const id = `print-${m.id}`;
            collectedWorks.push({
              id,
              title: m.title || 'Editorial Publication',
              disciplines: ['EDITORIAL', (m.category || 'PRINT').toUpperCase()],
              category: 'print',
              cover,
              images: [cover],
              description:
                m.description ||
                'Editorial publication layout and art direction.',
              pdfUrl: !isImageUrl(m.pdf_url) ? m.pdf_url : undefined,
              year: m.year || '2025',
            });
            if (isImageUrl(m.pdf_url)) {
              collectedArchive.push({
                id: `arc-${id}`,
                title: m.title || 'Editorial',
                image: cover,
                linkedWorkId: id,
                category: 'Print',
              });
            }
          }
        }

        if (videosRes.data?.length) {
          for (const v of videosRes.data) {
            const ytId = getYoutubeId(v.video_url);
            const thumb =
              v.thumbnail_url ||
              (ytId
                ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                : FALLBACK_WORKS[2].cover);
            const id = `motion-${v.id}`;
            const rawHint = `${v.aspect_ratio || ''} ${v.orientation || ''} ${v.category || ''} ${v.title || ''} ${v.video_url || ''}`.toLowerCase();
            const isPortrait =
              rawHint.includes('9:16') ||
              rawHint.includes('portrait') ||
              rawHint.includes('vertical') ||
              rawHint.includes('/shorts/') ||
              rawHint.includes('instagram.com/reel') ||
              rawHint.includes('tiktok.com') ||
              /\breels?\b/.test(rawHint);
            const videoFormat: '16:9' | '9:16' = isPortrait ? '9:16' : '16:9';

            collectedWorks.push({
              id,
              title: v.title || 'Motion Reel',
              disciplines: ['VIDEO', videoFormat, (v.category || 'FILM').toUpperCase()],
              category: 'motion',
              cover: thumb,
              images: [thumb],
              description:
                v.description ||
                'Direction, editing, and visual pacing for digital media.',
              href: v.video_url,
              videoFormat,
              year: v.created_at
                ? String(new Date(v.created_at).getFullYear())
                : '2025',
            });
            collectedArchive.push({
              id: `arc-${id}`,
              title: v.title || 'Motion Reel',
              image: thumb,
              linkedWorkId: id,
              category: 'Video',
            });
          }
        }

        if (projectsRes.data?.length) {
          for (const p of projectsRes.data) {
            if (p.mode !== 'creative' && p.mode !== 'all') continue;
            if (!p.image_url) continue;
            const id = `proj-${p.id}`;
            collectedWorks.push({
              id,
              title: p.title || 'Creative Project',
              disciplines: Array.isArray(p.stack) && p.stack.length > 0
                ? p.stack.slice(0, 2).map((s: string) => s.toUpperCase())
                : ['CREATIVE DIRECTION'],
              category: 'design',
              cover: p.image_url,
              images: [p.image_url],
              description: p.description || '',
              href: p.demo_url || undefined,
              year: p.year || '2025',
            });
          }
        }

        if (galleryRes.data?.length) {
          const validPhotos = galleryRes.data.filter((g: any) => g.image_url);
          const mappedPhotos: ArchiveTile[] = validPhotos.map(
            (g: any, idx: number) => ({
              id: `gal-${g.id || idx}`,
              title: g.caption || g.title || `Frame ${String(idx + 1).padStart(2, '0')}`,
              image: g.image_url,
              category: g.category || 'Photo',
            })
          );
          if (mappedPhotos.length > 0) {
            setPhotoTiles(mappedPhotos);
            collectedArchive.push(...mappedPhotos);
          }
        }

        if (expRes.data?.length) {
          setExperiences(
            expRes.data.map((e: any, idx: number) => ({
              id: String(e.id || idx),
              company: e.company || 'Studio',
              role: e.title || 'Creative Role',
              period: e.timeline || '2025',
              description: (e.description || e.desc || '')
                .replace(/<!--\s*LOGO_URL:.*?-->/g, '')
                .trim(),
            }))
          );
        }

        if (collectedWorks.length > 0) setWorks(collectedWorks);
        if (collectedArchive.length > 0) setArchiveTiles(collectedArchive);
      } catch {
        // Keep fallbacks
      }
    }

    loadArtData();
  }, []);

  const emailAddress = settings.email_address || 'contact@dri4n.com';
  const instagramUrl =
    settings.instagram_url || 'https://instagram.com/adrianbahri';
  const linkedinUrl =
    settings.linkedin_url || 'https://linkedin.com/in/adrianbahri';
  const githubUrl = settings.github_url || 'https://github.com/Adrianbahri';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  // Exact Gaurav Mishra (jackingcactus.com) palette — Light & inverted Dark
  const c =
    theme === 'dark'
      ? {
          bg: '#0A0A0A',
          ink: '#FFFFFF',
          ink2: '#D4D4D4',
          muted: '#8A8A8A',
          hair: '#3A3A3A',
          pill: '#1A1A1A',
          placeholder: '#171717',
          closeBg: '#1C1C1C',
        }
      : {
          bg: '#FFFFFF',
          ink: '#000000',
          ink2: '#313131',
          muted: '#757575',
          hair: '#D9D9D9',
          pill: '#F4F4F4',
          placeholder: '#EAEAEA',
          closeBg: '#EAEAEA',
        };

  const designWorks = useMemo(
    () => works.filter((w) => w.category === 'design' || w.category === 'print'),
    [works]
  );
  const videoWorks = useMemo(
    () => works.filter((w) => w.category === 'motion'),
    [works]
  );
  const dividerColor =
    theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <div
      data-dev-theme={theme}
      className="dev-shell art-custom-cursor-active relative min-h-screen w-full text-[12px] leading-[1.2] antialiased selection:bg-[#ff5a3d] selection:text-white"
      style={{
        backgroundColor: c.bg,
        color: c.ink,
      }}
    >
      <ArtCursor />

      {/* =================================================================
          FIXED ULTRA-MINIMAL SWISS TOP BAR (1fr 1fr Grid + Thin 1px Divider)
      ================================================================== */}
      <header
        className="fixed left-0 right-0 top-0 z-30 w-full uppercase"
        style={{
          backgroundColor: c.bg,
          borderBottom: `1px solid ${dividerColor}`,
          letterSpacing: '-0.34px',
          lineHeight: '14px',
        }}
      >
        <div className="flex flex-col items-center gap-2.5 px-3 py-2.5 md:grid md:h-[32px] md:grid-cols-2 md:items-center md:gap-0 md:px-[10px] md:py-0">
          {/* Left 50%: Brand + Circular Portal back to Dev Side */}
          <div className="flex w-full items-center justify-between md:w-auto md:justify-start md:gap-4">
            <button
              type="button"
              onClick={() => selectTab('archive')}
              className="text-left hover:underline underline-offset-[2px]"
            >
              ©ADRIAN BAHRI
            </button>
            <button
              type="button"
              onClick={(e) => navigateWithCirclePortal('/', router, e)}
              className="transition-opacity hover:underline underline-offset-[2px]"
              style={{ color: c.muted }}
            >
              ← DEV SIDE
            </button>
          </div>

          {/* Right 50% (aligned cleanly at 50% on desktop): Nav Tabs + Theme Toggle */}
          <nav
            aria-label="Creative navigation"
            className="flex w-full items-center justify-between gap-3 md:justify-start md:gap-[16px]"
          >
            {(
              [
                ['archive', 'ARCHIVE'],
                ['design', 'DESIGN'],
                ['video', 'VIDEO'],
                ['photo', 'PHOTO'],
                ['about', 'ABOUT'],
              ] as [ArtTab, string][]
            ).map(([tabKey, label]) => {
              const isActive = !selectedWork && activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => selectTab(tabKey)}
                  className={`underline-offset-[3px] hover:underline ${
                    isActive ? 'underline' : ''
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* Far-right Light / Dark Theme Toggle */}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => switchTheme('light', e)}
                className={`underline-offset-[3px] hover:underline ${
                  theme === 'light' ? 'underline' : 'opacity-45'
                }`}
              >
                LIGHT
              </button>
              <span style={{ color: c.hair }}>/</span>
              <button
                type="button"
                onClick={(e) => switchTheme('dark', e)}
                className={`underline-offset-[3px] hover:underline ${
                  theme === 'dark' ? 'underline' : 'opacity-45'
                }`}
              >
                DARK
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* =================================================================
          CASE STUDY DETAIL VIEW (Exact Gaurav Mishra DOOMERS TAPE Split Layout)
      ================================================================== */}
      {selectedWork ? (
        <main className="relative min-h-screen pb-24 pt-[84px] md:pt-[112px]">
          {/* Fixed Top-Right 34x34 Close X Box */}
          <button
            type="button"
            aria-label="Close project"
            onClick={() => setSelectedWork(null)}
            className="fixed right-[10px] top-[68px] z-20 flex h-[34px] w-[34px] items-center justify-center transition-opacity hover:opacity-75 md:top-[52px]"
            style={{
              backgroundColor: c.closeBg,
              color: c.muted,
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Left Fixed 178px Minimal Explanation Sidebar */}
          <aside className="px-[10px] pb-8 md:fixed md:bottom-[36px] md:left-[10px] md:top-[112px] md:flex md:w-[178px] md:flex-col md:px-0 md:pb-0">
            <h1
              className="text-[12px] font-normal uppercase leading-[15px]"
              style={{ letterSpacing: '-0.12px', color: c.ink }}
            >
              {selectedWork.title}
            </h1>

            {/* Clean Sentence-Case Explanation Paragraph */}
            <p
              className="mt-4 text-[10.5px] leading-[15px]"
              style={{ color: c.muted, letterSpacing: '-0.1px' }}
            >
              {selectedWork.description ||
                `Visual work and creative exploration in ${selectedWork.disciplines
                  .join(', ')
                  .toLowerCase()} by Adrian Bahri (Dri4n).`}
            </p>

            {/* Bottom-Pinned Credits / Details Block (exact Gaurav Mishra bottom-left anchor) */}
            <div
              className="mt-8 space-y-2.5 text-[10px] leading-[14px] md:mt-auto"
              style={{ color: c.muted, letterSpacing: '-0.1px' }}
            >
              <p style={{ color: c.ink2 }}>Project details :</p>
              <p>
                {selectedWork.disciplines.join(', ')}
                {selectedWork.year ? ` · ${selectedWork.year}` : ''}
              </p>

              {selectedWork.pdfUrl && (
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('open-pdf-reader', {
                        detail: {
                          url: selectedWork.pdfUrl,
                          title: selectedWork.title,
                        },
                      })
                    )
                  }
                  className="block uppercase underline underline-offset-[2px] hover:opacity-75"
                  style={{ color: c.ink }}
                >
                  OPEN PUBLICATION PDF ↗
                </button>
              )}
              {selectedWork.href && (
                <a
                  href={selectedWork.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block uppercase underline underline-offset-[2px] hover:opacity-75"
                  style={{ color: c.ink }}
                >
                  OPEN ORIGINAL MEDIA ↗
                </a>
              )}
            </div>
          </aside>

          {/* Right Uncropped Gallery Showcase (centered with generous whitespace like DOOMERS TAPE) */}
          <div className="space-y-8 px-[10px] md:ml-[220px] md:mr-[56px] md:px-0">
            {selectedWork.category === 'motion' && selectedWork.href ? (
              <div className="flex w-full justify-center">
                {(() => {
                  const ytId = getYoutubeId(selectedWork.href);
                  const directVid = isDirectVideoUrl(selectedWork.href);
                  const isPortrait = selectedWork.videoFormat === '9:16';
                  if (directVid) {
                    return (
                      <video
                        src={selectedWork.href}
                        controls
                        autoPlay
                        playsInline
                        className={`max-h-[82vh] w-auto max-w-full ${
                          isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]'
                        }`}
                      />
                    );
                  }
                  if (ytId) {
                    return (
                      <div
                        className={`w-full overflow-hidden ${
                          isPortrait
                            ? 'max-w-[380px] aspect-[9/16]'
                            : 'max-w-[960px] aspect-[16/9]'
                        }`}
                        style={{ backgroundColor: c.placeholder }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                          title={selectedWork.title}
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                          className="h-full w-full border-0"
                        />
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              selectedWork.images.map((imgUrl, idx) => (
                <div
                  key={`${selectedWork.id}-img-${idx}`}
                  className="flex w-full items-center justify-center"
                >
                  {!brokenImages[imgUrl] ? (
                    <img
                      src={imgUrl}
                      alt={`${selectedWork.title} — ${idx + 1}`}
                      onError={() => markImageBroken(imgUrl)}
                      className="max-h-[84vh] w-auto max-w-full object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-[320px] w-full items-center justify-center uppercase"
                      style={{
                        backgroundColor: c.placeholder,
                        color: c.muted,
                      }}
                    >
                      {selectedWork.title}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      ) : (
        <main>
          {/* ===============================================================
              TAB 1: ARCHIVE — 3 Curated Rows:
              Row 1: 3 Animated 4:5 Design Slots
              Row 2: 2 Animated 4:3 Photo Slots
              Row 3: 2 Auto-Playing 16:9 Landscape Videos + 1 Auto-Playing 9:16 Vertical Video
          ================================================================ */}
          {activeTab === 'archive' && (() => {
            // Flatten all design images across every design work for rich animated variety
            const allDesignSlides: { id: string; image: string; title: string }[] = [];
            for (const w of designWorks) {
              const imgs = w.images?.length ? w.images : [w.cover];
              imgs.forEach((img, idx) => {
                if (img) {
                  allDesignSlides.push({
                    id: `${w.id}-${idx}`,
                    image: img,
                    title: w.title,
                  });
                }
              });
            }
            if (allDesignSlides.length === 0) {
              allDesignSlides.push({
                id: 'fb-d',
                image: FALLBACK_WORKS[0].cover,
                title: FALLBACK_WORKS[0].title,
              });
            }

            // Split design slides into 3 distinct rotating pools so all 3 slots show different works
            const designPools = [0, 1, 2].map((slotIdx) => {
              const pool = allDesignSlides.filter(
                (_, i) => i % 3 === slotIdx
              );
              const list = pool.length > 0 ? pool : allDesignSlides;
              return list.slice(0, 6);
            });

            // Split photo tiles into 2 distinct rotating pools for Row 2
            const allPhotos =
              photoTiles.length > 0
                ? photoTiles
                : [
                    {
                      id: 'fb-p',
                      image: FALLBACK_WORKS[3].cover,
                      title: FALLBACK_WORKS[3].title,
                      category: 'Photo',
                    },
                  ];
            const photoPools = [0, 1].map((slotIdx) => {
              const pool = allPhotos.filter((_, i) => i % 2 === slotIdx);
              const list = pool.length > 0 ? pool : allPhotos;
              return list.slice(0, 6);
            });

            // Pick 2 landscape (16:9) + 1 vertical (9:16) auto-playing videos for Row 3
            const landscapePool = videoWorks.filter(
              (v) => v.videoFormat !== '9:16'
            );
            const portraitPool = videoWorks.filter(
              (v) => v.videoFormat === '9:16'
            );
            const featuredLandscape: ArtWorkItem[] = [
              landscapePool[0] || videoWorks[0] || FALLBACK_WORKS[2],
              landscapePool[1] ||
                videoWorks[1] ||
                landscapePool[0] ||
                FALLBACK_WORKS[2],
            ];
            const featuredVertical: ArtWorkItem =
              portraitPool[0] ||
              videoWorks[2] ||
              videoWorks[0] ||
              FALLBACK_WORKS[2];

            const renderAutoPlayVideo = (
              vid: ArtWorkItem,
              isVertical: boolean
            ) => {
              const ytId = getYoutubeId(vid.href);
              const directVid = isDirectVideoUrl(vid.href);

              return (
                <button
                  type="button"
                  onClick={() => selectTab('video')}
                  className={`group relative block w-full overflow-hidden text-left ${
                    isVertical
                      ? 'aspect-[9/16] md:aspect-auto md:h-full md:min-h-[420px]'
                      : 'aspect-[16/9]'
                  }`}
                  style={{ backgroundColor: c.placeholder }}
                >
                  {/* Fallback Poster Image underneath while video initializes */}
                  {vid.cover && !brokenImages[vid.cover] && (
                    <Image
                      src={vid.cover}
                      alt={vid.title}
                      fill
                      unoptimized
                      sizes={isVertical ? '38vw' : '62vw'}
                      onError={() => markImageBroken(vid.cover)}
                      className="object-cover"
                    />
                  )}

                  {/* Auto-Playing Direct MP4/WebM Video */}
                  {directVid && vid.href && (
                    <video
                      src={vid.href}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    />
                  )}

                  {/* Auto-Playing Muted YouTube Embed (seamless background playback) */}
                  {!directVid && ytId && (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3`}
                      title={vid.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className="pointer-events-none absolute inset-0 h-full w-full scale-[1.18] border-0"
                    />
                  )}

                  {/* Subtle Frosted Caption Overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 via-black/20 to-transparent px-3 pb-3 pt-10 text-white">
                    <div className="min-w-0">
                      <p className="truncate text-[11.5px] font-medium uppercase tracking-[-0.01em]">
                        {vid.title}
                      </p>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-white/75">
                        {isVertical ? 'PORTRAIT · 9:16' : 'LANDSCAPE · 16:9'}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase text-white/85">
                      OPEN ↗
                    </span>
                  </div>
                </button>
              );
            };

            return (
              <section className="space-y-[44px] pt-[88px] md:space-y-[56px] md:pt-[132px]">
                {/* 50%-Offset Swiss Typographic Intro */}
                <div className="px-[10px] md:ml-[50%] md:max-w-[603px] md:px-0 md:pr-4">
                  <p className="text-[12px] uppercase leading-[16.5px]">
                    A COLLECTION OF VISUAL WORK, EXPERIMENTS, AND IDEAS — SOME
                    MADE WITH PURPOSE, OTHERS SIMPLY BECAUSE I WANTED TO,
                    EVERYTHING I&apos;VE EXPLORED ALONG THE WAY, FROM ROUGH
                    EXPERIMENTS TO WELL THOUGHT PROJECTS.
                  </p>
                </div>

                {/* ROW 1: DESIGN — 3 Animated 4:5 Slots */}
                <div className="px-[9px]">
                  <div
                    className="mb-[12px] flex items-center justify-between pt-3 font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderTop: `1px solid ${dividerColor}`,
                      color: c.muted,
                    }}
                  >
                    <span>DESIGN</span>
                    <button
                      type="button"
                      onClick={() => selectTab('design')}
                      className="underline-offset-[3px] hover:underline"
                      style={{ color: c.ink }}
                    >
                      OPEN DESIGN ↗
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-[9px] sm:grid-cols-3">
                    {designPools.map((pool, slotIdx) => {
                      const activeIdx = slotTicks[slotIdx] % pool.length;
                      const current = pool[activeIdx];
                      const isHovered = hoveredSlot === slotIdx;

                      return (
                        <button
                          key={`design-slot-${slotIdx}`}
                          type="button"
                          onClick={() => selectTab('design')}
                          onMouseEnter={() => setHoveredSlot(slotIdx)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className="group relative block aspect-[4/5] w-full overflow-hidden text-left"
                          style={{ backgroundColor: c.placeholder }}
                        >
                          {pool.map((slide, sIdx) => {
                            const isCurrent = sIdx === activeIdx;
                            return (
                              <div
                                key={slide.id}
                                className="absolute inset-0 will-change-[opacity,transform]"
                                style={{
                                  opacity: isCurrent ? 1 : 0,
                                  transform: isCurrent
                                    ? isHovered
                                      ? 'scale(1.03)'
                                      : 'scale(1)'
                                    : 'scale(1.06)',
                                  transition:
                                    'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                              >
                                {!brokenImages[slide.image] ? (
                                  <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                    onError={() => markImageBroken(slide.image)}
                                    className="object-cover"
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <p className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-white">
                              {current?.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 2: PHOTO — 2 Animated 4:3 Landscape Slots */}
                <div className="px-[9px]">
                  <div
                    className="mb-[12px] flex items-center justify-between pt-3 font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderTop: `1px solid ${dividerColor}`,
                      color: c.muted,
                    }}
                  >
                    <span>PHOTO</span>
                    <button
                      type="button"
                      onClick={() => selectTab('photo')}
                      className="underline-offset-[3px] hover:underline"
                      style={{ color: c.ink }}
                    >
                      OPEN PHOTO ↗
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-[9px] md:grid-cols-2">
                    {photoPools.map((pool, idx) => {
                      const slotIdx = 3 + idx;
                      const activeIdx = slotTicks[slotIdx] % pool.length;
                      const current = pool[activeIdx];
                      const isHovered = hoveredSlot === slotIdx;

                      return (
                        <button
                          key={`photo-slot-${idx}`}
                          type="button"
                          onClick={() => selectTab('photo')}
                          onMouseEnter={() => setHoveredSlot(slotIdx)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className="group relative block aspect-[4/3] w-full overflow-hidden text-left"
                          style={{ backgroundColor: c.placeholder }}
                        >
                          {pool.map((slide, sIdx) => {
                            const isCurrent = sIdx === activeIdx;
                            return (
                              <div
                                key={slide.id}
                                className="absolute inset-0 will-change-[opacity,transform]"
                                style={{
                                  opacity: isCurrent ? 1 : 0,
                                  transform: isCurrent
                                    ? isHovered
                                      ? 'scale(1.03)'
                                      : 'scale(1)'
                                    : 'scale(1.06)',
                                  transition:
                                    'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                              >
                                {!brokenImages[slide.image] ? (
                                  <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    onError={() => markImageBroken(slide.image)}
                                    className="object-cover"
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <p className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-white">
                              {current?.title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ROW 3: VIDEO — 2 Auto-Playing Landscape (16:9) + 1 Auto-Playing Vertical (9:16) */}
                <div className="px-[9px]">
                  <div
                    className="mb-[12px] flex items-center justify-between pt-3 font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderTop: `1px solid ${dividerColor}`,
                      color: c.muted,
                    }}
                  >
                    <span>VIDEO</span>
                    <button
                      type="button"
                      onClick={() => selectTab('video')}
                      className="underline-offset-[3px] hover:underline"
                      style={{ color: c.ink }}
                    >
                      OPEN VIDEO ↗
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-[9px] md:grid-cols-[1.65fr_1fr]">
                    {/* Left: 2 Stacked 16:9 Landscape Auto-Playing Videos */}
                    <div className="flex flex-col gap-[9px]">
                      {featuredLandscape.map((vid, idx) => (
                        <div key={`land-vid-${vid.id}-${idx}`}>
                          {renderAutoPlayVideo(vid, false)}
                        </div>
                      ))}
                    </div>

                    {/* Right: 1 Tall 9:16 Vertical Auto-Playing Video (Flush Height!) */}
                    <div className="h-full">
                      {renderAutoPlayVideo(featuredVertical, true)}
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ===============================================================
              TAB 2: DESIGN (4:5 Portrait Editorial Ratio — 2-Col Mobile / 3-Col Desktop)
          ================================================================ */}
          {activeTab === 'design' && (
            <section className="px-[9px] pt-[92px] md:pt-[150px]">
              <div
                className="mb-[18px] flex items-center justify-between pb-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
                style={{
                  borderBottom: `1px solid ${dividerColor}`,
                  color: c.muted,
                }}
              >
                <span>DESIGN</span>
                <span>{String(designWorks.length).padStart(2, '0')} WORKS</span>
              </div>

              <div className="grid grid-cols-2 gap-x-[9px] gap-y-[22px] md:grid-cols-3 md:gap-y-[28px]">
                {designWorks.map((work) => (
                  <article
                    key={work.id}
                    onClick={() => {
                      if (work.pdfUrl) {
                        window.dispatchEvent(
                          new CustomEvent('open-pdf-reader', {
                            detail: { url: work.pdfUrl, title: work.title },
                          })
                        );
                      } else {
                        setSelectedWork(work);
                        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
                      }
                    }}
                    className="group cursor-pointer"
                  >
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden"
                      style={{ backgroundColor: c.placeholder }}
                    >
                      {!brokenImages[work.cover] ? (
                        <Image
                          src={work.cover}
                          alt={work.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 50vw, 33vw"
                          onError={() => markImageBroken(work.cover)}
                          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center uppercase"
                          style={{ color: c.muted }}
                        >
                          {work.title}
                        </div>
                      )}
                    </div>
                    <div
                      className="mt-[9px] flex items-center justify-between gap-2 text-[11.5px] uppercase leading-[14.4px] underline-offset-[2px] group-hover:underline sm:text-[12px]"
                      style={{ color: c.ink2, letterSpacing: '-0.12px' }}
                    >
                      <span className="truncate">
                        {work.title} | {work.disciplines.join(', ')}
                      </span>
                      {work.pdfUrl && (
                        <span className="shrink-0 font-mono text-[10px]" style={{ color: c.muted }}>
                          PDF ↗
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ===============================================================
              TAB 3: VIDEO (Supports Landscape 16:9 & Portrait 9:16 Native Ratios!)
          ================================================================ */}
          {activeTab === 'video' && (() => {
            const landscapeVideos = videoWorks.filter(
              (v) => v.videoFormat !== '9:16'
            );
            const portraitVideos = videoWorks.filter(
              (v) => v.videoFormat === '9:16'
            );

            const renderVideoCard = (vid: ArtWorkItem, isPortrait: boolean) => (
              <article
                key={vid.id}
                onClick={() => {
                  setSelectedWork(vid);
                  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
                }}
                className="group cursor-pointer"
              >
                <div
                  className={`relative w-full overflow-hidden ${
                    isPortrait ? 'aspect-[9/16]' : 'aspect-[16/9]'
                  }`}
                  style={{ backgroundColor: c.placeholder }}
                >
                  {!brokenImages[vid.cover] ? (
                    <Image
                      src={vid.cover}
                      alt={vid.title}
                      fill
                      unoptimized
                      sizes={
                        isPortrait
                          ? '(max-width: 768px) 50vw, 25vw'
                          : '(max-width: 768px) 100vw, 50vw'
                      }
                      onError={() => markImageBroken(vid.cover)}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}

                  {/* Signature Frosted-Glass Floating Play Pill */}
                  <div
                    className="absolute inset-x-[12px] bottom-[12px] flex h-[42px] items-center justify-between rounded-[8px] px-3 backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(235, 235, 235, 0.5)',
                      color: '#1f1f1f',
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-white">
                        <Play size={10} className="ml-0.5 fill-white" />
                      </span>
                      <span className="truncate text-[11px] font-medium uppercase tracking-[-0.01em]">
                        {vid.title}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase opacity-75">
                      {isPortrait ? '9:16' : '16:9'} ↗
                    </span>
                  </div>
                </div>
              </article>
            );

            return (
              <section className="px-[9px] pt-[92px] md:px-[14px] md:pt-[150px]">
                <div
                  className="mb-[20px] flex items-center justify-between pb-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
                  style={{
                    borderBottom: `1px solid ${dividerColor}`,
                    color: c.muted,
                  }}
                >
                  <span>VIDEO</span>
                  <span>{String(videoWorks.length).padStart(2, '0')} VIDEOS</span>
                </div>

                {landscapeVideos.length > 0 && (
                  <div className="space-y-3">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: c.muted }}
                    >
                      LANDSCAPE — 16:9 ({String(landscapeVideos.length).padStart(2, '0')})
                    </p>
                    <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 md:gap-[16px]">
                      {landscapeVideos.map((vid) => renderVideoCard(vid, false))}
                    </div>
                  </div>
                )}

                {portraitVideos.length > 0 && (
                  <div
                    className={
                      landscapeVideos.length > 0 ? 'mt-[36px] space-y-3 pt-[28px]' : 'space-y-3'
                    }
                    style={
                      landscapeVideos.length > 0
                        ? { borderTop: `1px solid ${dividerColor}` }
                        : undefined
                    }
                  >
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.12em]"
                      style={{ color: c.muted }}
                    >
                      PORTRAIT / REELS — 9:16 ({String(portraitVideos.length).padStart(2, '0')})
                    </p>
                    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 md:grid-cols-4 md:gap-[14px]">
                      {portraitVideos.map((vid) => renderVideoCard(vid, true))}
                    </div>
                  </div>
                )}
              </section>
            );
          })()}

          {/* ===============================================================
              TAB 4: PHOTO (4:3 Landscape Photography Grid — Strictly Gallery Table)
          ================================================================ */}
          {activeTab === 'photo' && (
            <section className="px-[9px] pt-[92px] md:pt-[150px]">
              <div
                className="mb-[18px] flex items-center justify-between pb-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
                style={{
                  borderBottom: `1px solid ${dividerColor}`,
                  color: c.muted,
                }}
              >
                <span>PHOTO</span>
                <span>{String(photoTiles.length).padStart(2, '0')} FRAMES</span>
              </div>

              <div className="grid grid-cols-1 gap-[7px] sm:grid-cols-2 md:grid-cols-3 md:gap-[9px]">
                {photoTiles.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      setSelectedWork({
                        id: photo.id,
                        title: photo.title,
                        disciplines: ['PHOTOGRAPHY', photo.category.toUpperCase()],
                        category: 'photo',
                        cover: photo.image,
                        images: [photo.image],
                        description: `Photographic frame captured and curated by Adrian Bahri (Dri4n) under ${photo.category}.`,
                        year: '2025',
                      });
                      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
                    }}
                    className="group relative block aspect-[4/3] w-full overflow-hidden text-left"
                    style={{ backgroundColor: c.placeholder }}
                  >
                    {!brokenImages[photo.image] ? (
                      <Image
                        src={photo.image}
                        alt={photo.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        onError={() => markImageBroken(photo.image)}
                        className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center uppercase"
                        style={{ color: c.muted }}
                      >
                        PHOTO
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent px-2.5 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="block truncate text-[11px] uppercase text-white">
                        {photo.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ===============================================================
              TAB 5: ABOUT (Exact Gaurav Mishra 2-Column Swiss Grid!)
          ================================================================ */}
          {activeTab === 'about' && (
            <section className="px-4 pb-[80px] pt-[100px] uppercase leading-[15.9px] md:px-0 md:pt-[183px]">
              {/* 1. WHO AM I */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
                <div className="md:pr-[111px] md:text-right">WHO AM I</div>
                <div className="max-w-[475px] space-y-4">
                  <p>
                    I&apos;M ADRIAN BAHRI (DRI4N), A CREATIVE TECHNOLOGIST &amp;
                    VISUAL DESIGNER BASED IN MAKASSAR, INDONESIA. MY WORK IS
                    ROOTED IN BRANDING, EDITORIAL LAYOUTS, MOTION DIRECTION, AND
                    DIGITAL SYSTEMS WITH A FOCUS ON TRANSLATING IDEAS INTO CLEAR
                    FORM.
                  </p>
                  <p>
                    ALONGSIDE ENGINEERING FULL-STACK PLATFORMS, I MAINTAIN AN
                    INDEPENDENT VISUAL PRACTICE DRIVEN BY CURIOSITY — EXPLORING
                    PRINT, FILM, PHOTOGRAPHY, AND GRAPHIC IDENTITY.
                  </p>
                  <p>
                    I&apos;M INTERESTED IN WORK THAT HAS A POINT OF VIEW, BUT
                    DOESN&apos;T TAKE ITSELF TOO SERIOUSLY.
                  </p>
                </div>
              </div>

              {/* 2. WORK EXPERIENCE (Synced with Supabase) */}
              <div
                className="mt-[60px] grid grid-cols-1 gap-3 pt-[48px] md:mt-[76px] md:grid-cols-2 md:gap-0 md:pt-[64px]"
                style={{ borderTop: `1px solid ${dividerColor}` }}
              >
                <div className="md:pr-[111px] md:text-right">
                  WORK EXPERIENCE
                </div>
                <div className="max-w-[475px] space-y-7">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="space-y-2.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold">
                          {exp.company} | {exp.role}
                        </span>
                        <span style={{ color: c.muted }}>{exp.period}</span>
                      </div>
                      {exp.description && (
                        <p style={{ color: c.ink2 }}>{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. SKILLS */}
              <div
                className="mt-[60px] grid grid-cols-1 gap-3 pt-[48px] md:mt-[76px] md:grid-cols-2 md:gap-0 md:pt-[64px]"
                style={{ borderTop: `1px solid ${dividerColor}` }}
              >
                <div className="md:pr-[111px] md:text-right">SKILLS</div>
                <div className="max-w-[475px] space-y-6">
                  <div className="space-y-1">
                    <p>CREATIVE DIRECTION</p>
                    <p>BRAND &amp; VISUAL IDENTITY</p>
                    <p>EDITORIAL &amp; PUBLICATION DESIGN</p>
                    <p>MOTION &amp; VIDEO EDITING</p>
                    <p>PHOTOGRAPHY &amp; COLOR GRADING</p>
                    <p>UI/UX &amp; INTERACTIVE SYSTEMS</p>
                  </div>
                  {creativeTools.length > 0 && (
                    <div className="space-y-1" style={{ color: c.muted }}>
                      {creativeTools.map((t) => (
                        <p key={t.name}>{t.name}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. CONNECT (Exact #d9d9d9 Suffix Tags!) */}
              <div
                className="mt-[60px] grid grid-cols-1 gap-3 pt-[48px] md:mt-[76px] md:grid-cols-2 md:gap-0 md:pt-[64px]"
                style={{ borderTop: `1px solid ${dividerColor}` }}
              >
                <div className="md:pr-[111px] md:text-right">CONNECT</div>
                <div className="max-w-[475px] space-y-1.5">
                  <div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="underline-offset-[2px] hover:underline"
                    >
                      {copiedEmail ? 'COPIED TO CLIPBOARD' : emailAddress}
                    </button>{' '}
                    <span style={{ color: c.hair }}>| MAIL</span>
                  </div>
                  <div>
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-[2px] hover:underline"
                    >
                      @ADRIANBAHRI
                    </a>{' '}
                    <span style={{ color: c.hair }}>| INSTAGRAM</span>
                  </div>
                  <div>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-[2px] hover:underline"
                    >
                      ADRIAN BAHRI
                    </a>{' '}
                    <span style={{ color: c.hair }}>| LINKEDIN</span>
                  </div>
                  <div>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-[2px] hover:underline"
                    >
                      ADRIANBAHRI
                    </a>{' '}
                    <span style={{ color: c.hair }}>| GITHUB</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={(e) => navigateWithCirclePortal('/', router, e)}
                      className="underline-offset-[2px] hover:underline"
                    >
                      DRI4N.COM
                    </button>{' '}
                    <span style={{ color: c.hair }}>| DEV PORTFOLIO</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ===============================================================
              MINIMAL RIGHT-ALIGNED SWISS FOOTER + THIN 1PX TOP DIVIDER
          ================================================================ */}
          <footer
            className="mx-[9px] mt-[100px] flex flex-col items-start gap-4 pb-[80px] pt-[36px] uppercase leading-[15.9px] md:mt-[180px] md:flex-row md:items-center md:justify-end md:gap-[32px] md:pb-[140px] md:pl-[8px] md:pr-[6.7%] md:pt-[44px]"
            style={{
              letterSpacing: '-0.34px',
              borderTop: `1px solid ${dividerColor}`,
            }}
          >
            <button
              type="button"
              onClick={() => selectTab('archive')}
              className="hover:underline underline-offset-[2px]"
            >
              ©ADRIAN BAHRI
            </button>
            <span style={{ color: c.muted }}>MULTIDISCIPLINARY CREATIVE</span>
            <p
              className="max-w-[350px]"
              style={{ letterSpacing: '0px', color: c.ink2 }}
            >
              STILL MAKING THINGS, STILL LOOKING FOR THINGS TO MAKE. IF
              SOMETHING HERE CAUGHT YOUR ATTENTION, SAY HELLO.{' '}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="underline underline-offset-[2px]"
              >
                {copiedEmail ? 'COPIED!' : emailAddress}
              </button>
            </p>
          </footer>
        </main>
      )}

      {/* Minimal Sharp Lightbox for Single Archive Photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative w-full max-w-[820px] p-2"
            style={{ backgroundColor: c.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={lightboxImage.image}
                alt={lightboxImage.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-2 flex items-center justify-between px-1 uppercase">
              <span>
                {lightboxImage.title} | {lightboxImage.category}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="underline underline-offset-[2px]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
