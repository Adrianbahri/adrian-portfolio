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
import {
  navigateWithCirclePortal,
  signalPortalRouteReady,
} from '@/lib/portalTransition';
import { ArtCursor } from '@/components/ArtCursor';
import '@/styles/shahriyar.css';

type ArtSection = 'design' | 'print' | 'video' | 'photo' | 'growth' | 'about';

interface SocialGrowthItem {
  id: string;
  account: string;
  handle: string;
  platform: string;
  role: string;
  period: string;
  focus: string;
  highlights: string[];
}

const DEFAULT_SOCIAL_GROWTH: SocialGrowthItem[] = [
  {
    id: 'sg-identitas',
    account: 'PK Identitas Unhas',
    handle: '@identitasunhas',
    platform: 'INSTAGRAM · CAMPUS MEDIA',
    role: 'DATA, EDITORIAL & VISUAL SYSTEMS',
    period: '2025 — NOW',
    focus:
      'Data journalism carousels, editorial infographics (SNBP, Pilrek Unhas), print magazine layout, and automated publishing workflows for Universitas Hasanuddin’s official student press.',
    highlights: [
      'Data-driven infographic series & high-share campus coverage',
      'Consistent editorial visual language across print & social feeds',
      'Structured content pipeline & digital workflow modernization',
    ],
  },
  {
    id: 'sg-sulawesipos',
    account: 'SulawesiPos.com',
    handle: 'Jawa Pos Group Network',
    platform: 'INSTAGRAM · TIKTOK · DIGITAL',
    role: 'MEDIA PRODUCTION & CONTENT',
    period: 'JAN 2026 — NOW',
    focus:
      'Daily digital content production, fast-turnaround news visual packaging, and short-form video editing under PT Tiran Multimedia Nusantara (Jawa Pos Group).',
    highlights: [
      'High-frequency daily visual publishing & breaking-news templates',
      'Short-form vertical reels & documentary storytelling',
      'Cross-platform audience retention & visual consistency',
    ],
  },
  {
    id: 'sg-kedai',
    account: 'Kedai Ayah UQ',
    handle: 'F&B Brand Campaign',
    platform: 'INSTAGRAM · PROMOTIONAL',
    role: 'GRAPHIC DESIGNER & SOCIAL VISUALS',
    period: 'JUN — SEP 2025',
    focus:
      'Campaign direction, promotional social feeds, seasonal menu visuals, and cohesive café marketing collateral tailored for local Makassar audiences.',
    highlights: [
      'End-to-end promotional feed & story visual templates',
      'Product-focused campaign graphics & seasonal promos',
      'Unified brand palette & typography for F&B identity',
    ],
  },
];

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

let artMemCache: {
  works?: ArtWorkItem[];
  archiveTiles?: ArchiveTile[];
  photoTiles?: ArchiveTile[];
  experiences?: ExpRow[];
} | null = null;

export default function ArtSiteView({
  initialSettings,
}: {
  initialSettings?: Record<string, string>;
}) {
  const router = useRouter();
  const { settings } = useSiteSettings(initialSettings);

  // Synced Light & Dark Theme (Default Dark across both Dev & Art)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeSection, setActiveSection] = useState<ArtSection>('design');
  const [selectedWork, setSelectedWork] = useState<ArtWorkItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ArchiveTile | null>(null);
  const [works, setWorks] = useState<ArtWorkItem[]>(
    () => artMemCache?.works || FALLBACK_WORKS
  );
  const [archiveTiles, setArchiveTiles] = useState<ArchiveTile[]>(
    () => artMemCache?.archiveTiles || FALLBACK_ARCHIVE
  );
  const [photoTiles, setPhotoTiles] = useState<ArchiveTile[]>(
    () =>
      artMemCache?.photoTiles ||
      FALLBACK_ARCHIVE.filter((a) => a.category === 'Photo')
  );
  const [experiences, setExperiences] = useState<ExpRow[]>(
    () =>
      artMemCache?.experiences ||
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

  const creativeTools = useMemo(
    () => techStack.filter((t) => t.mode === 'creative'),
    []
  );

  // Sync saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
    router.prefetch('/');
    const readyCap = window.setTimeout(() => signalPortalRouteReady('/art'), 450);
    return () => window.clearTimeout(readyCap);
  }, [router]);

  // Smooth scroll to hash section if user lands directly on /art#video, /art#photo, etc.
  useEffect(() => {
    const scrollToHash = () => {
      const h = window.location.hash.replace('#', '').toLowerCase();
      if (
        h === 'design' ||
        h === 'print' ||
        h === 'video' ||
        h === 'photo' ||
        h === 'growth' ||
        h === 'about'
      ) {
        setSelectedWork(null);
        setActiveSection(h);
        window.requestAnimationFrame(() => {
          document.getElementById(h)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  // Lightweight scroll-spy to highlight current section in sticky Swiss top bar
  useEffect(() => {
    if (selectedWork) return;
    const ids: ArtSection[] = ['design', 'print', 'video', 'photo', 'growth', 'about'];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id as ArtSection);
        }
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: 0.01 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selectedWork]);

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

  const scrollToSection = (section: ArtSection) => {
    setSelectedWork(null);
    setActiveSection(section);
    window.history.replaceState(null, '', `/art#${section}`);
    window.requestAnimationFrame(() => {
      document
        .getElementById(section)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const scrollToTop = () => {
    setSelectedWork(null);
    window.history.replaceState(null, '', '/art');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markImageBroken = (src: string) => {
    setBrokenImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };

  // Load Adrian's live data from Supabase (cached in memory across navigations)
  useEffect(() => {
    if (artMemCache) {
      signalPortalRouteReady('/art');
      return;
    }

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

        const nextCache: NonNullable<typeof artMemCache> = {};

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
            nextCache.photoTiles = mappedPhotos;
            collectedArchive.push(...mappedPhotos);
          }
        }

        if (expRes.data?.length) {
          const mappedExp = expRes.data.map((e: any, idx: number) => ({
            id: String(e.id || idx),
            company: e.company || 'Studio',
            role: e.title || 'Creative Role',
            period: e.timeline || '2025',
            description: (e.description || e.desc || '')
              .replace(/<!--\s*LOGO_URL:.*?-->/g, '')
              .trim(),
          }));
          setExperiences(mappedExp);
          nextCache.experiences = mappedExp;
        }

        if (collectedWorks.length > 0) {
          setWorks(collectedWorks);
          nextCache.works = collectedWorks;
        }
        if (collectedArchive.length > 0) {
          setArchiveTiles(collectedArchive);
          nextCache.archiveTiles = collectedArchive;
        }
        if (Object.keys(nextCache).length > 0) {
          artMemCache = nextCache;
        }
      } catch {
        // Keep fallbacks
      } finally {
        signalPortalRouteReady('/art');
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
    () => works.filter((w) => w.category === 'design'),
    [works]
  );
  const printWorks = useMemo(
    () => works.filter((w) => w.category === 'print'),
    [works]
  );
  const videoWorks = useMemo(
    () => works.filter((w) => w.category === 'motion'),
    [works]
  );
  const landscapeVideos = useMemo(
    () => videoWorks.filter((v) => v.videoFormat !== '9:16'),
    [videoWorks]
  );
  const portraitVideos = useMemo(
    () => videoWorks.filter((v) => v.videoFormat === '9:16'),
    [videoWorks]
  );
  const socialGrowthItems = useMemo<SocialGrowthItem[]>(() => {
    if (settings.social_growth) {
      try {
        const parsed = JSON.parse(settings.social_growth);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback to default curated growth cases
      }
    }
    return DEFAULT_SOCIAL_GROWTH;
  }, [settings.social_growth]);

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
              onClick={scrollToTop}
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

          {/* Right 50% (aligned cleanly at 50% on desktop): Single-Page Anchor Nav + Theme Toggle */}
          <nav
            aria-label="Creative sections"
            className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 md:flex-nowrap md:justify-start md:gap-[14px]"
          >
            {(
              [
                ['design', 'DESIGN'],
                ['print', 'PRINT'],
                ['video', 'VIDEO'],
                ['photo', 'PHOTO'],
                ['growth', 'GROWTH'],
                ['about', 'ABOUT'],
              ] as [ArtSection, string][]
            ).map(([secKey, label]) => {
              const isActive = !selectedWork && activeSection === secKey;
              return (
                <button
                  key={secKey}
                  type="button"
                  onClick={() => scrollToSection(secKey)}
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
        <main className="space-y-[64px] pt-[92px] md:space-y-[96px] md:pt-[132px]">
          {/* ===============================================================
              HERO — 50%-Offset Swiss Typographic Intro + Complete Single-Page Index
          ================================================================ */}
          <section className="px-[10px] md:ml-[50%] md:max-w-[603px] md:px-0 md:pr-4">
            <p className="text-[12px] uppercase leading-[16.5px]">
              A COMPLETE SINGLE-PAGE ARCHIVE OF VISUAL DESIGN, PRINT &amp;
              INFOGRAPHICS, VIDEO DIRECTION, PHOTOGRAPHY, AND SOCIAL MEDIA
              GROWTH BY ADRIAN BAHRI (DRI4N) — SCROLL THROUGH EVERY DISCIPLINE
              BELOW OR JUMP DIRECTLY FROM THE TOP BAR.
            </p>
            <div
              className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em]"
              style={{ color: c.muted }}
            >
              <span>{String(designWorks.length).padStart(2, '0')} DESIGN</span>
              <span>·</span>
              <span>{String(printWorks.length).padStart(2, '0')} PRINT</span>
              <span>·</span>
              <span>{String(videoWorks.length).padStart(2, '0')} VIDEO</span>
              <span>·</span>
              <span>{String(photoTiles.length).padStart(2, '0')} PHOTO</span>
              <span>·</span>
              <span>
                {String(socialGrowthItems.length).padStart(2, '0')} SOCIAL GROWTH
              </span>
            </div>
          </section>

          {/* ===============================================================
              01 / DESIGN — Visual Identity, Editorial & Data Graphics (4:5 Grid)
          ================================================================ */}
          <section id="design" className="scroll-mt-[64px] px-[9px]">
            <div
              className="mb-[18px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>01 / DESIGN &amp; VISUAL PROJECTS</span>
              <span>{String(designWorks.length).padStart(2, '0')} PROJECTS</span>
            </div>

            <div className="grid grid-cols-2 gap-x-[9px] gap-y-[22px] md:grid-cols-3 md:gap-y-[28px]">
              {designWorks.map((work) => (
                <article
                  key={work.id}
                  onClick={() => {
                    setSelectedWork(work);
                    window.scrollTo({
                      top: 0,
                      behavior: 'instant' as ScrollBehavior,
                    });
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
                    {work.images.length > 1 && (
                      <span className="pointer-events-none absolute right-2 top-2 bg-black/65 px-1.5 py-0.5 font-mono text-[9.5px] text-white backdrop-blur-sm">
                        {work.images.length} SLIDES
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-[9px] flex items-center justify-between gap-2 text-[11.5px] uppercase leading-[14.4px] underline-offset-[2px] group-hover:underline sm:text-[12px]"
                    style={{ color: c.ink2, letterSpacing: '-0.12px' }}
                  >
                    <span className="truncate">
                      {work.title} | {work.disciplines.join(', ')}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px]"
                      style={{ color: c.muted }}
                    >
                      OPEN ↗
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ===============================================================
              02 / PRINT & INFOGRAFIS CETAK — Editorial Print, Magazines & Packaging
          ================================================================ */}
          <section id="print" className="scroll-mt-[64px] px-[9px]">
            <div
              className="mb-[18px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>02 / PRINT, EDITORIAL &amp; INFOGRAFIS CETAK</span>
              <span>{String(printWorks.length).padStart(2, '0')} EDITIONS</span>
            </div>

            <div className="grid grid-cols-1 gap-[12px] sm:grid-cols-2 md:grid-cols-3 md:gap-[14px]">
              {printWorks.map((work) => (
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
                      window.scrollTo({
                        top: 0,
                        behavior: 'instant' as ScrollBehavior,
                      });
                    }
                  }}
                  className="group cursor-pointer"
                >
                  <div
                    className="relative aspect-[4/5] w-full overflow-hidden"
                    style={{
                      backgroundColor: c.placeholder,
                      border: `1px solid ${dividerColor}`,
                    }}
                  >
                    {!brokenImages[work.cover] ? (
                      <Image
                        src={work.cover}
                        alt={work.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
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
                    <span className="pointer-events-none absolute left-2.5 top-2.5 bg-black/70 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                      {work.pdfUrl ? 'PRINT PDF' : 'PRINT / INFOGRAFIS'}
                    </span>
                  </div>
                  <div
                    className="mt-[9px] flex items-center justify-between gap-2 text-[11.5px] uppercase leading-[14.4px] underline-offset-[2px] group-hover:underline sm:text-[12px]"
                    style={{ color: c.ink2, letterSpacing: '-0.12px' }}
                  >
                    <span className="truncate">
                      {work.title} | {work.disciplines.join(', ')}
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px]"
                      style={{ color: c.ink }}
                    >
                      {work.pdfUrl ? 'READ PDF ↗' : 'VIEW ↗'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ===============================================================
              03 / VIDEO & MOTION — Landscape 16:9 & Portrait 9:16
          ================================================================ */}
          <section id="video" className="scroll-mt-[64px] px-[9px]">
            <div
              className="mb-[20px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>03 / VIDEO &amp; MOTION PROJECTS</span>
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
                  {landscapeVideos.map((vid) => (
                    <article
                      key={vid.id}
                      onClick={() => {
                        setSelectedWork(vid);
                        window.scrollTo({
                          top: 0,
                          behavior: 'instant' as ScrollBehavior,
                        });
                      }}
                      className="group cursor-pointer"
                    >
                      <div
                        className="relative aspect-[16/9] w-full overflow-hidden"
                        style={{ backgroundColor: c.placeholder }}
                      >
                        {!brokenImages[vid.cover] ? (
                          <Image
                            src={vid.cover}
                            alt={vid.title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 100vw, 50vw"
                            onError={() => markImageBroken(vid.cover)}
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : null}

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
                            16:9 ↗
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {portraitVideos.length > 0 && (
              <div
                className={
                  landscapeVideos.length > 0
                    ? 'mt-[32px] space-y-3 pt-[24px]'
                    : 'space-y-3'
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
                  PORTRAIT / REELS — 9:16 (
                  {String(portraitVideos.length).padStart(2, '0')})
                </p>
                <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 md:grid-cols-4 md:gap-[14px]">
                  {portraitVideos.map((vid) => (
                    <article
                      key={vid.id}
                      onClick={() => {
                        setSelectedWork(vid);
                        window.scrollTo({
                          top: 0,
                          behavior: 'instant' as ScrollBehavior,
                        });
                      }}
                      className="group cursor-pointer"
                    >
                      <div
                        className="relative aspect-[9/16] w-full overflow-hidden"
                        style={{ backgroundColor: c.placeholder }}
                      >
                        {!brokenImages[vid.cover] ? (
                          <Image
                            src={vid.cover}
                            alt={vid.title}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 50vw, 25vw"
                            onError={() => markImageBroken(vid.cover)}
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : null}

                        <div
                          className="absolute inset-x-[10px] bottom-[10px] flex h-[38px] items-center justify-between rounded-[8px] px-2.5 backdrop-blur-md"
                          style={{
                            backgroundColor: 'rgba(235, 235, 235, 0.5)',
                            color: '#1f1f1f',
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-white">
                              <Play size={9} className="ml-0.5 fill-white" />
                            </span>
                            <span className="truncate text-[10.5px] font-medium uppercase">
                              {vid.title}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[9.5px] uppercase opacity-75">
                            9:16 ↗
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ===============================================================
              04 / PHOTOGRAPHY GALLERY — Full-Quality Curated Frames (4:3 Grid)
          ================================================================ */}
          <section id="photo" className="scroll-mt-[64px] px-[9px]">
            <div
              className="mb-[18px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>04 / PHOTOGRAPHY GALLERY</span>
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
                      description: `Original full-quality photographic frame captured and curated by Adrian Bahri (Dri4n) under ${photo.category}.`,
                      year: '2025',
                    });
                    window.scrollTo({
                      top: 0,
                      behavior: 'instant' as ScrollBehavior,
                    });
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

          {/* ===============================================================
              05 / SOCIAL MEDIA GROWTH — Managed Accounts & Digital Reach
          ================================================================ */}
          <section id="growth" className="scroll-mt-[64px] px-[9px]">
            <div
              className="mb-[20px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>05 / SOCIAL MEDIA GROWTH &amp; MEDIA MANAGEMENT</span>
              <span>
                {String(socialGrowthItems.length).padStart(2, '0')} ACCOUNTS
              </span>
            </div>

            <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3">
              {socialGrowthItems.map((item, idx) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between p-4 md:p-5"
                  style={{
                    backgroundColor: c.pill,
                    border: `1px solid ${dividerColor}`,
                  }}
                >
                  <div>
                    <div
                      className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.12em]"
                      style={{ color: c.muted }}
                    >
                      <span>{String(idx + 1).padStart(2, '0')} · {item.platform}</span>
                      <span>{item.period}</span>
                    </div>

                    <h3 className="mt-3 text-[15px] font-medium uppercase tracking-[-0.02em]">
                      {item.account}
                    </h3>
                    <p
                      className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em]"
                      style={{ color: '#ff5a3d' }}
                    >
                      {item.handle} — {item.role}
                    </p>

                    <p
                      className="mt-3.5 text-[11.5px] leading-[1.55]"
                      style={{ color: c.ink2 }}
                    >
                      {item.focus}
                    </p>
                  </div>

                  <ul
                    className="mt-5 space-y-1.5 pt-3 text-[10.5px] leading-[1.45]"
                    style={{
                      borderTop: `1px solid ${dividerColor}`,
                      color: c.muted,
                    }}
                  >
                    {item.highlights.map((hl, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <span
                          className="mt-[5px] inline-block h-[4px] w-[4px] shrink-0"
                          style={{ backgroundColor: '#ff5a3d' }}
                        />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* ===============================================================
              06 / ABOUT — Exact Gaurav Mishra 2-Column Swiss Grid
          ================================================================ */}
          <section
            id="about"
            className="scroll-mt-[64px] px-4 pt-6 uppercase leading-[15.9px] md:px-0"
          >
            <div
              className="mx-[9px] mb-[40px] flex items-center justify-between pt-3 font-mono text-[10.5px] uppercase tracking-[0.12em]"
              style={{
                borderTop: `1px solid ${dividerColor}`,
                color: c.muted,
              }}
            >
              <span>06 / ABOUT &amp; CONNECT</span>
              <span>MAKASSAR · INDONESIA</span>
            </div>

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
                  PRINT, FILM, PHOTOGRAPHY, SOCIAL GROWTH, AND GRAPHIC IDENTITY.
                </p>
              </div>
            </div>

            {/* 2. WORK EXPERIENCE (Synced with Database) */}
            <div
              className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
              style={{ borderTop: `1px solid ${dividerColor}` }}
            >
              <div className="md:pr-[111px] md:text-right">WORK EXPERIENCE</div>
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
              className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
              style={{ borderTop: `1px solid ${dividerColor}` }}
            >
              <div className="md:pr-[111px] md:text-right">SKILLS</div>
              <div className="max-w-[475px] space-y-6">
                <div className="space-y-1">
                  <p>CREATIVE DIRECTION</p>
                  <p>BRAND &amp; VISUAL IDENTITY</p>
                  <p>EDITORIAL, PRINT &amp; INFOGRAPHIC DESIGN</p>
                  <p>MOTION &amp; VIDEO EDITING</p>
                  <p>PHOTOGRAPHY &amp; COLOR GRADING</p>
                  <p>SOCIAL MEDIA GROWTH &amp; CONTENT SYSTEMS</p>
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

            {/* 4. CONNECT */}
            <div
              className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
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

          {/* ===============================================================
              MINIMAL RIGHT-ALIGNED SWISS FOOTER + THIN 1PX TOP DIVIDER
          ================================================================ */}
          <footer
            className="mx-[9px] flex flex-col items-start gap-4 pb-[80px] pt-[36px] uppercase leading-[15.9px] md:flex-row md:items-center md:justify-end md:gap-[32px] md:pb-[120px] md:pl-[8px] md:pr-[6.7%] md:pt-[44px]"
            style={{
              letterSpacing: '-0.34px',
              borderTop: `1px solid ${dividerColor}`,
            }}
          >
            <button
              type="button"
              onClick={scrollToTop}
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
