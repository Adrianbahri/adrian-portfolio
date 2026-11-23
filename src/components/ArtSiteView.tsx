'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PHOTO_STORIES, parseGalleryMeta } from '@/lib/galleryMeta';
import {
  isVideoMediaUrl,
  parseMediaShowcase,
  parseOrgBranding,
  type MediaPlatformKey,
  type OrgBrandingKey,
} from '@/lib/mediaShowcase';
import {
  parseIdentitasShowcase,
  toYouTubeEmbedUrl,
  type IdentitasDesignItem,
  type IdentitasDocItem,
  type IdentitasModeKey,
} from '@/lib/identitasShowcase';
import {
  PRINT_CATEGORY_LABELS,
  parsePrintShowcase,
  type PrintFilterKey,
} from '@/lib/printShowcase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  applyThemePreference,
  runThemeTransition,
  subscribeThemeStorage,
} from '@/lib/themeTransition';
import {
  navigateWithCirclePortal,
  signalPortalRouteReady,
} from '@/lib/portalTransition';
import '@/styles/shahriyar.css';

export interface IndustrialPhotoItem {
  id: string;
  title: string;
  tags: string[];
  caption: string;
  image: string;
  extraImages?: string[];
  date: string;
}

export interface ArtWritingItem {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  role: 'written' | 'edited';
  date: string;
}

const FALLBACK_ARTICLES: ArtWritingItem[] = [
  {
    id: 'note-1',
    slug: 'note-1',
    title: 'Design Is Subjective, but Clarity Is Not',
    excerpt:
      'Notes on why restraint, clean hierarchy, and visual discipline outlast short-lived trends in digital design.',
    coverImage:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'November, 2026',
  },
  {
    id: 'note-2',
    slug: 'note-2',
    title: 'Why Regional Newsrooms Need Faster Visual Systems',
    excerpt:
      'Lessons from building repeatable editorial templates for high-velocity daily news across TikTok and YouTube.',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'October, 2026',
  },
  {
    id: 'note-3',
    slug: 'note-3',
    title: 'From Print Grid to Vertical Video: Keeping Identity Intact',
    excerpt:
      'Translating typography, pacing, and color language from physical print pages to 9:16 mobile screens.',
    coverImage:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=85',
    role: 'edited',
    date: 'September, 2026',
  },
  {
    id: 'note-4',
    slug: 'note-4',
    title: 'Notes on Documentary Framing and Unhurried Photography',
    excerpt:
      'Observing natural light, architectural shadows, and authentic human rhythm across streets in Makassar.',
    coverImage:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'August, 2026',
  },
  {
    id: 'note-5',
    slug: 'note-5',
    title: 'Building Editorial Discipline Inside a Student Press',
    excerpt:
      'How structured workflows and data journalism transformed campus storytelling at PK Identitas Unhas.',
    coverImage:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
    role: 'edited',
    date: 'June, 2026',
  },
  {
    id: 'note-6',
    slug: 'note-6',
    title: 'Why Restraint Beats Decoration in Industrial Interfaces',
    excerpt:
      'Stripping away visual noise so typography, photography, and functional craft carry the entire experience.',
    coverImage:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=85',
    role: 'written',
    date: 'April, 2026',
  },
];

const FALLBACK_PHOTOS: IndustrialPhotoItem[] = [
  {
    id: 'fallback-photo-1',
    title: MOCK_PHOTO_STORIES[0].title,
    tags: MOCK_PHOTO_STORIES[0].tags,
    caption: MOCK_PHOTO_STORIES[0].narrative,
    image:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=80',
    date: '2026',
  },
  {
    id: 'fallback-photo-2',
    title: MOCK_PHOTO_STORIES[1].title,
    tags: MOCK_PHOTO_STORIES[1].tags,
    caption: MOCK_PHOTO_STORIES[1].narrative,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    date: '2026',
  },
  {
    id: 'fallback-photo-3',
    title: MOCK_PHOTO_STORIES[2].title,
    tags: MOCK_PHOTO_STORIES[2].tags,
    caption: MOCK_PHOTO_STORIES[2].narrative,
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80',
    date: '2025',
  },
];

let cachedPhotos: IndustrialPhotoItem[] | null = null;

export default function ArtSiteView({
  initialSettings,
  initialPhotos = [],
  initialArticles = [],
  initialIdentitasDesigns = [],
  initialIdentitasDocs = [],
}: {
  initialSettings?: Record<string, string>;
  initialPhotos?: IndustrialPhotoItem[];
  initialArticles?: ArtWritingItem[];
  initialIdentitasDesigns?: IdentitasDesignItem[];
  initialIdentitasDocs?: IdentitasDocItem[];
}) {
  const router = useRouter();
  const { settings } = useSiteSettings(initialSettings);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [photos, setPhotos] = useState<IndustrialPhotoItem[]>(() =>
    initialPhotos.length > 0
      ? initialPhotos
      : cachedPhotos && cachedPhotos.length > 0
      ? cachedPhotos
      : FALLBACK_PHOTOS
  );
  const [loadingPhotos, setLoadingPhotos] = useState(
    initialPhotos.length === 0 && !cachedPhotos
  );
  const [photoError, setPhotoError] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNavSection, setActiveNavSection] = useState<
    'photo' | 'medsos' | 'print' | 'writing'
  >('photo');
  const [articles, setArticles] = useState<ArtWritingItem[]>(() =>
    initialArticles.length > 0 ? initialArticles : FALLBACK_ARTICLES
  );
  const [writingFilter, setWritingFilter] = useState<
    'all' | 'written' | 'edited'
  >('all');

  useEffect(() => {
    if (initialArticles.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });
        if (mounted && data && data.length > 0) {
          const creativeOnly = data.filter((a: any) => {
            if (!a.title) return false;
            const tagsText = Array.isArray(a.tags)
              ? a.tags.join(' ')
              : String(a.tags || '');
            const hay = `${a.category || ''} ${tagsText}`.toLowerCase();
            return hay.includes('creative');
          });
          if (creativeOnly.length > 0) {
            setArticles(
              creativeOnly.map((a: any, idx: number) => {
                const rawBody = String(
                  a.description || a.excerpt || a.content || ''
                )
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
              })
            );
          }
        }
      } catch {
        // Keep fallbacks
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialArticles.length]);
  const [activePlatform, setActivePlatform] =
    useState<MediaPlatformKey>('tiktok');
  const [mediaPaused, setMediaPaused] = useState(false);
  const [activeOrg, setActiveOrg] = useState<OrgBrandingKey>('arjuna');
  const [orgPaused, setOrgPaused] = useState(false);
  const [identitasMode, setIdentitasMode] =
    useState<IdentitasModeKey>('videos');
  const [videoSlots, setVideoSlots] = useState<[number, number]>([0, 1]);
  const [nextVideoSlot, setNextVideoSlot] = useState<0 | 1>(0);
  const [designSlots, setDesignSlots] = useState<[number, number]>([0, 1]);
  const [nextDesignSlot, setNextDesignSlot] = useState<0 | 1>(0);
  const [draggedMarker, setDraggedMarker] = useState<0 | 1 | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [activeDocIdx, setActiveDocIdx] = useState(0);
  const [designLightboxIdx, setDesignLightboxIdx] = useState<number | null>(
    null
  );
  const [printFilter, setPrintFilter] = useState<PrintFilterKey>('all');
  const [activePrintIdx, setActivePrintIdx] = useState(0);
  const [printLightboxIdx, setPrintLightboxIdx] = useState<number | null>(null);
  const [targetSlideIdx, setTargetSlideIdx] = useState<number>(0);

  // Auto-transition between TikTok and YouTube every 5 seconds (pauses on hover or detail modal)
  useEffect(() => {
    if (mediaPaused || lightboxIdx !== null) return;
    const timer = window.setInterval(() => {
      setActivePlatform((prev) => (prev === 'tiktok' ? 'youtube' : 'tiktok'));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [mediaPaused, lightboxIdx, activePlatform]);

  // Auto-transition between Arjuna UH and KKNT Assamaturu every 5 seconds
  useEffect(() => {
    if (orgPaused || lightboxIdx !== null || designLightboxIdx !== null) return;
    const timer = window.setInterval(() => {
      setActiveOrg((prev) => (prev === 'arjuna' ? 'kknt' : 'arjuna'));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [orgPaused, lightboxIdx, designLightboxIdx, activeOrg]);

  const identitasShowcase = parseIdentitasShowcase(settings.identitas_showcase);
  const identitasVideos = identitasShowcase.videos;
  const identitasDesigns =
    !settings.identitas_showcase && initialIdentitasDesigns.length > 0
      ? initialIdentitasDesigns
      : identitasShowcase.designs;
  const identitasDocs =
    !settings.identitas_showcase && initialIdentitasDocs.length > 0
      ? initialIdentitasDocs
      : identitasShowcase.documenters;

  const getNextQueuedIndex = useCallback(
    (currentSlots: [number, number], slotToAdvance: 0 | 1, total: number) => {
      if (total <= 1) return 0;
      const other = currentSlots[slotToAdvance === 0 ? 1 : 0] % total;
      let candidate = (currentSlots[slotToAdvance] + 1) % total;
      if (total > 2 && candidate === other) {
        candidate = (candidate + 1) % total;
      }
      return candidate;
    },
    []
  );

  const advanceVideoSlot = useCallback(
    (slot: 0 | 1) => {
      if (identitasVideos.length <= 2) return;
      setVideoSlots((prev) => {
        const nextIdx = getNextQueuedIndex(prev, slot, identitasVideos.length);
        return slot === 0 ? [nextIdx, prev[1]] : [prev[0], nextIdx];
      });
    },
    [getNextQueuedIndex, identitasVideos.length]
  );

  const dropMarkerOnIndex = (
    mode: IdentitasModeKey,
    marker: 0 | 1,
    targetIdx: number
  ) => {
    if (mode === 'documenter') {
      setActiveDocIdx(targetIdx);
      return;
    }
    const updateSlots = (prev: [number, number]): [number, number] => {
      const otherSlot: 0 | 1 = marker === 0 ? 1 : 0;
      if (prev[marker] === targetIdx) return prev;
      // If dropped on the item currently held by the other marker, swap them cleanly
      if (prev[otherSlot] === targetIdx) {
        return [prev[1], prev[0]];
      }
      return marker === 0 ? [targetIdx, prev[1]] : [prev[0], targetIdx];
    };
    if (mode === 'videos') {
      setVideoSlots(updateSlots);
    } else if (mode === 'design') {
      setDesignSlots(updateSlots);
    }
  };

  const selectVideoIndependent = (idx: number) => {
    setVideoSlots((prev) => {
      if (prev[0] === idx || prev[1] === idx) return prev;
      return nextVideoSlot === 0 ? [idx, prev[1]] : [prev[0], idx];
    });
    setNextVideoSlot((prev) => (prev === 0 ? 1 : 0));
  };

  const selectDesignIndependent = (idx: number) => {
    setDesignSlots((prev) => {
      if (prev[0] === idx || prev[1] === idx) return prev;
      return nextDesignSlot === 0 ? [idx, prev[1]] : [prev[0], idx];
    });
    setNextDesignSlot((prev) => (prev === 0 ? 1 : 0));
  };

  const primaryVideoUrl =
    identitasVideos[
      identitasVideos.length > 0 ? videoSlots[0] % identitasVideos.length : 0
    ]?.mediaUrl || '';
  const primaryVideoIsStaticPoster =
    Boolean(primaryVideoUrl) &&
    !isVideoMediaUrl(primaryVideoUrl) &&
    !toYouTubeEmbedUrl(primaryVideoUrl);

  // Videos mode: real <video> & YouTube advance independently on ended; static posters alternate every 5s
  useEffect(() => {
    if (
      identitasMode !== 'videos' ||
      !primaryVideoIsStaticPoster ||
      videoPaused ||
      lightboxIdx !== null ||
      designLightboxIdx !== null ||
      identitasVideos.length <= 2
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      advanceVideoSlot(nextVideoSlot);
      setNextVideoSlot((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [
    identitasMode,
    primaryVideoIsStaticPoster,
    videoPaused,
    lightboxIdx,
    designLightboxIdx,
    identitasVideos.length,
    advanceVideoSlot,
    nextVideoSlot,
  ]);

  // Design mode: auto-advance 1 row independently every 5 seconds (pauses on hover or detail modal)
  useEffect(() => {
    if (
      identitasMode !== 'design' ||
      videoPaused ||
      lightboxIdx !== null ||
      designLightboxIdx !== null ||
      identitasDesigns.length <= 2
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setDesignSlots((prev) => {
        const nextIdx = getNextQueuedIndex(
          prev,
          nextDesignSlot,
          identitasDesigns.length
        );
        return nextDesignSlot === 0 ? [nextIdx, prev[1]] : [prev[0], nextIdx];
      });
      setNextDesignSlot((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [
    identitasMode,
    videoPaused,
    lightboxIdx,
    designLightboxIdx,
    identitasDesigns.length,
    getNextQueuedIndex,
    nextDesignSlot,
  ]);

  // Listen to YouTube iframe postMessage "ended" (playerState === 0) for Videos & Documenter
  useEffect(() => {
    if (identitasMode !== 'videos' && identitasMode !== 'documenter') return;
    const onMessage = (event: MessageEvent) => {
      if (
        typeof event.origin !== 'string' ||
        !event.origin.includes('youtube.com')
      ) {
        return;
      }
      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        const playerState =
          data?.event === 'onStateChange'
            ? data?.info
            : data?.event === 'infoDelivery'
            ? data?.info?.playerState
            : null;
        if (playerState === 0) {
          if (identitasMode === 'documenter' && identitasDocs.length > 1) {
            setActiveDocIdx((prev) => (prev + 1) % identitasDocs.length);
          } else if (identitasMode === 'videos' && identitasVideos.length > 2) {
            advanceVideoSlot(nextVideoSlot);
            setNextVideoSlot((prev) => (prev === 0 ? 1 : 0));
          }
        }
      } catch {
        // Ignore non-JSON postMessages
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [
    identitasMode,
    identitasDocs.length,
    identitasVideos.length,
    advanceVideoSlot,
    nextVideoSlot,
  ]);

  // Lightweight GPU-only scroll reveal observer for all /art sections & cards
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-art-reveal]')
    );
    if (nodes.length === 0) return;

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach((el) => el.setAttribute('data-revealed', 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    nodes.forEach((el) => {
      if (el.getAttribute('data-revealed') !== 'true') {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [photos.length, articles.length, writingFilter, printFilter, identitasMode]);

  // Track scroll for navbar background + active section highlight (PHOTO / MEDSOS / PRINT / WRITING)
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
      const writingEl = document.getElementById('writing');
      const printEl = document.getElementById('print-works');
      const medsosEl = document.getElementById('media-production');
      const midY = window.innerHeight * 0.35;
      if (writingEl && writingEl.getBoundingClientRect().top <= midY) {
        setActiveNavSection('writing');
      } else if (printEl && printEl.getBoundingClientRect().top <= midY) {
        setActiveNavSection('print');
      } else if (medsosEl && medsosEl.getBoundingClientRect().top <= midY) {
        setActiveNavSection('medsos');
      } else {
        setActiveNavSection('photo');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync theme with localStorage & cross-tab storage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
    router.prefetch('/');
    const readyCap = window.setTimeout(() => signalPortalRouteReady('/art'), 320);
    const unsub = subscribeThemeStorage((next) => setTheme(next));
    return () => {
      window.clearTimeout(readyCap);
      unsub();
    };
  }, [router]);

  // Fetch ALL photos from Supabase gallery table
  const fetchAllPhotos = useCallback(async () => {
    setPhotoError(false);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: IndustrialPhotoItem[] = data
          .filter((g: any) => Boolean(g.image_url))
          .map((g: any, idx: number) => {
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
        if (mapped.length > 0) {
          cachedPhotos = mapped;
          setPhotos(mapped);
        }
      }
    } catch {
      if (initialPhotos.length === 0 && !cachedPhotos) {
        setPhotoError(true);
      }
    } finally {
      setLoadingPhotos(false);
      signalPortalRouteReady('/art');
    }
  }, [initialPhotos.length]);

  useEffect(() => {
    if (initialPhotos.length > 0) {
      cachedPhotos = initialPhotos;
      setLoadingPhotos(false);
      signalPortalRouteReady('/art');
      return;
    }
    if (cachedPhotos && cachedPhotos.length > 0) {
      setLoadingPhotos(false);
      signalPortalRouteReady('/art');
      return;
    }
    fetchAllPhotos();
  }, [initialPhotos, fetchAllPhotos]);

  const totalPhotos = photos.length;

  const printShowcase = parsePrintShowcase(settings.print_works_showcase);
  const filteredPrintItems =
    printFilter === 'all'
      ? printShowcase.items
      : printShowcase.items.filter((it) => it.category === printFilter);
  const safePrintIdx =
    filteredPrintItems.length > 0
      ? activePrintIdx % filteredPrintItems.length
      : 0;
  const activePrintItem = filteredPrintItems[safePrintIdx] || null;

  const activeDetailSource: 'photo' | 'design' | 'print' =
    printLightboxIdx !== null
      ? 'print'
      : designLightboxIdx !== null
      ? 'design'
      : 'photo';

  const activeDetailList =
    activeDetailSource === 'print'
      ? filteredPrintItems.map((p) => ({
          id: p.id,
          title: p.title,
          tags: [
            PRINT_CATEGORY_LABELS[p.category].toUpperCase(),
            p.spec,
            p.year,
          ].filter(Boolean),
          caption: p.narrative,
          image: p.image,
          extraImages: p.extraImages || [],
        }))
      : activeDetailSource === 'design'
      ? identitasDesigns.map((d) => ({
          id: d.id,
          title: d.title,
          tags: d.tags,
          caption: d.narrative,
          image: d.image,
          extraImages: d.extraImages || [],
        }))
      : photos;

  const activeDetailIdx =
    activeDetailSource === 'print'
      ? printLightboxIdx
      : activeDetailSource === 'design'
      ? designLightboxIdx
      : lightboxIdx;

  const closeDetailSheet = () => {
    setLightboxIdx(null);
    setDesignLightboxIdx(null);
    setPrintLightboxIdx(null);
    setTargetSlideIdx(0);
  };

  const stepDetailSheet = useCallback(
    (dir: -1 | 1) => {
      const len = activeDetailList.length;
      if (len <= 1) return;
      if (activeDetailSource === 'print') {
        setPrintLightboxIdx((prev) =>
          prev === null ? 0 : (prev + dir + len) % len
        );
      } else if (activeDetailSource === 'design') {
        setDesignLightboxIdx((prev) =>
          prev === null ? 0 : (prev + dir + len) % len
        );
      } else {
        setLightboxIdx((prev) =>
          prev === null ? 0 : (prev + dir + len) % len
        );
      }
      setTargetSlideIdx(0);
    },
    [activeDetailList.length, activeDetailSource]
  );

  // Scroll detail sheet directly to the clicked slide (e.g. slide 3 or 5th peek slide)
  useEffect(() => {
    if (activeDetailIdx === null) return;
    if (targetSlideIdx <= 0) return;
    const raf = window.requestAnimationFrame(() => {
      const el = document.getElementById(`detail-slide-${targetSlideIdx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [activeDetailIdx, targetSlideIdx]);

  // Keyboard navigation + body scroll lock for detail sheet
  useEffect(() => {
    if (activeDetailIdx === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailSheet();
      } else if (e.key === 'ArrowRight') {
        stepDetailSheet(1);
      } else if (e.key === 'ArrowLeft') {
        stepDetailSheet(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeDetailIdx, stepDetailSheet]);

  const switchTheme = (
    next: 'dark' | 'light',
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (next === theme) return;
    runThemeTransition(() => {
      setTheme(next);
      applyThemePreference(next);
    }, e);
  };

  const emailAddress = settings.email_address || 'adrianbahri87@gmail.com';
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  // Industrialist color tokens (constrained 2-neutral + 1 safety-orange accent per DESIGN.md)
  const isDark = theme === 'dark';
  const palette = isDark
    ? {
        bg: '#0B0B0B',
        surface: '#121212',
        surfaceRaised: '#191919',
        border: '#272727',
        borderStrong: '#3B3B3B',
        ink: '#F2EFE9',
        inkSoft: '#BDB9B0',
        inkMuted: '#8F8B83',
        accent: '#EA6A12',
        accentInk: '#0B0B0B',
      }
    : {
        bg: '#F2EFE9',
        surface: '#E9E5DC',
        surfaceRaised: '#FFFFFF',
        border: '#D0CBBF',
        borderStrong: '#AFA99B',
        ink: '#141413',
        inkSoft: '#3A3732',
        inkMuted: '#5A564E',
        accent: '#D95B08',
        accentInk: '#FFFFFF',
      };

  const activeDetailItem =
    activeDetailIdx !== null
      ? activeDetailList[activeDetailIdx] || null
      : null;

  const videoSlotAIdx =
    identitasVideos.length > 0 ? videoSlots[0] % identitasVideos.length : 0;
  const videoSlotBIdx =
    identitasVideos.length > 1 ? videoSlots[1] % identitasVideos.length : 0;
  const videoSlotA = identitasVideos[videoSlotAIdx] || null;
  const videoSlotB =
    identitasVideos.length > 1 ? identitasVideos[videoSlotBIdx] || null : null;

  const safeDocIdx =
    identitasDocs.length > 0 ? activeDocIdx % identitasDocs.length : 0;
  const activeDoc = identitasDocs[safeDocIdx] || null;
  const activeDocEmbedUrl = toYouTubeEmbedUrl(activeDoc?.youtubeUrl);

  const designSlotAIdx =
    identitasDesigns.length > 0 ? designSlots[0] % identitasDesigns.length : 0;
  const designSlotBIdx =
    identitasDesigns.length > 1 ? designSlots[1] % identitasDesigns.length : 0;
  const activeDesignRows: Array<{
    theme: (typeof identitasDesigns)[number];
    themeIdx: number;
  }> = [];
  if (identitasDesigns[designSlotAIdx]) {
    activeDesignRows.push({
      theme: identitasDesigns[designSlotAIdx],
      themeIdx: designSlotAIdx,
    });
  }
  if (identitasDesigns.length > 1 && identitasDesigns[designSlotBIdx]) {
    activeDesignRows.push({
      theme: identitasDesigns[designSlotBIdx],
      themeIdx: designSlotBIdx,
    });
  }

  const mediaShowcase = parseMediaShowcase(settings.media_production_showcase);
  const orgBranding = parseOrgBranding(settings.org_branding_showcase);
  const activeOrgData = orgBranding.accounts[activeOrg];
  const orgMediaIsVideo = isVideoMediaUrl(activeOrgData.mediaUrl);
  const platformData = mediaShowcase.platforms[activePlatform];
  const activeMediaUrl =
    platformData.mediaUrl || platformData.screenshots?.[0]?.url || '';
  const activeChannelUrl = platformData.channelUrl || '#';
  const activeMediaIsVideo = isVideoMediaUrl(activeMediaUrl);

  const handleSelectPlatform = (next: MediaPlatformKey) => {
    setActivePlatform(next);
  };

  return (
    <div
      data-dev-theme={theme}
      className="art-swiss-scope min-h-screen w-full overflow-x-clip transition-colors duration-300 selection:bg-[#EA6A12] selection:text-[#0B0B0B]"
      style={{
        backgroundColor: palette.bg,
        color: palette.ink,
      }}
    >
      {/* Ultra-Thin Swiss Midpoint Utility Bar (28px, transparent on hero, solid on scroll) */}
      <header
        className="fixed inset-x-0 top-0 z-50 w-full transition-colors duration-200"
        style={{
          backgroundColor:
            isScrolled || activeDetailIdx !== null ? palette.bg : 'transparent',
        }}
      >
        <div className="grid h-[28px] w-full grid-cols-2 items-center px-2.5 sm:px-3 font-sans text-[11px] font-normal uppercase tracking-[-0.25px]">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={(e) => {
                navigateWithCirclePortal('/', router, e);
              }}
              data-cursor-label="dev"
              className="inline-flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: palette.inkMuted }}
            >
              <ArrowLeft size={10} aria-hidden="true" />
              <span>DEV</span>
            </button>
            <span
              className="hidden sm:inline font-normal normal-case"
              style={{ color: palette.ink }}
            >
              Adrian (Dri4n)
            </span>
            <Link
              href="/art/about"
              className="hidden sm:inline transition-opacity hover:underline hover:underline-offset-[2px]"
              style={{ color: palette.inkMuted }}
            >
              ABOUT
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3">
            <nav
              aria-label="Creative archive sections"
              className="hidden sm:flex items-center gap-4"
            >
              <a
                href="#photo"
                onClick={() => {
                  closeDetailSheet();
                  setActiveNavSection('photo');
                }}
                className={`transition-opacity hover:underline hover:underline-offset-[2px] ${
                  activeNavSection === 'photo'
                    ? 'underline underline-offset-[2px]'
                    : ''
                }`}
                style={{
                  color:
                    activeNavSection === 'photo'
                      ? palette.ink
                      : palette.inkMuted,
                }}
              >
                PHOTO
              </a>
              <a
                href="#media-production"
                onClick={() => {
                  closeDetailSheet();
                  setActiveNavSection('medsos');
                }}
                className={`transition-opacity hover:underline hover:underline-offset-[2px] ${
                  activeNavSection === 'medsos'
                    ? 'underline underline-offset-[2px]'
                    : ''
                }`}
                style={{
                  color:
                    activeNavSection === 'medsos'
                      ? palette.ink
                      : palette.inkMuted,
                }}
              >
                MEDSOS
              </a>
              <a
                href="#print-works"
                onClick={() => {
                  closeDetailSheet();
                  setActiveNavSection('print');
                }}
                className={`transition-opacity hover:underline hover:underline-offset-[2px] ${
                  activeNavSection === 'print'
                    ? 'underline underline-offset-[2px]'
                    : ''
                }`}
                style={{
                  color:
                    activeNavSection === 'print'
                      ? palette.ink
                      : palette.inkMuted,
                }}
              >
                PRINT
              </a>
              <a
                href="#writing"
                onClick={() => {
                  closeDetailSheet();
                  setActiveNavSection('writing');
                }}
                className={`transition-opacity hover:underline hover:underline-offset-[2px] ${
                  activeNavSection === 'writing'
                    ? 'underline underline-offset-[2px]'
                    : ''
                }`}
                style={{
                  color:
                    activeNavSection === 'writing'
                      ? palette.ink
                      : palette.inkMuted,
                }}
              >
                WRITING
              </a>
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={(e) =>
                  switchTheme(theme === 'dark' ? 'light' : 'dark', e)
                }
                aria-label={`Switch to ${
                  theme === 'dark' ? 'light' : 'dark'
                } mode`}
                className="cursor-pointer transition-opacity hover:underline hover:underline-offset-[2px]"
                style={{ color: palette.inkMuted }}
              >
                {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN EDGE-TO-EDGE MASTHEAD: Giant "Adrian" (Aguafina Script) */}
      <section
        aria-label="Creative Archive Masthead"
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: palette.bg }}
      >
        <div className="relative flex w-full items-center justify-center overflow-hidden select-none">
          <h1
            className="w-full text-center font-normal whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-art-script), cursive',
              fontSize: '46.5vw',
              lineHeight: 0.78,
              letterSpacing: '-0.015em',
              color: palette.accent,
              marginTop: '-0.11em',
              marginBottom: '0.03em',
            }}
          >
            Adrian
          </h1>

          {/* Overlaid Micro-Description (Clean Sans Uppercase, Zero Background) */}
          <div className="pointer-events-auto absolute bottom-[12%] left-[46%] right-[3%] hidden sm:block md:left-[50%] md:right-[4%]">
            <p
              className="font-sans text-[clamp(10px,1.2vw,16px)] font-light leading-[1.35] uppercase tracking-[0.025em]"
              style={{ color: palette.ink }}
            >
              {settings.art_intro ||
                'A COMPLETE SINGLE-PAGE ARCHIVE OF VISUAL DESIGN, PRINT & INFOGRAPHICS, VIDEO DIRECTION, PHOTOGRAPHY, AND SOCIAL MEDIA GROWTH BY ADRIAN (DRI4N). SCROLL THROUGH EVERY DISCIPLINE BELOW.'}
            </p>
          </div>
        </div>

        {/* Mobile placement for short description */}
        <div className="px-4 pb-4 sm:hidden">
          <p
            className="font-sans text-[11px] font-light leading-[1.45] uppercase tracking-[0.025em]"
            style={{ color: palette.ink }}
          >
            {settings.art_intro ||
              'A COMPLETE SINGLE-PAGE ARCHIVE OF VISUAL DESIGN, PRINT & INFOGRAPHICS, VIDEO DIRECTION, PHOTOGRAPHY, AND SOCIAL MEDIA GROWTH BY ADRIAN (DRI4N).'}
          </p>
        </div>
      </section>

      {/* Main Swiss-Industrialist Canvas */}
      <main id="main-content" className="w-full pb-20">
        {/* ROW 01: 2-COLUMN WIDE SWISS PHOTOGRAPHY GALLERY (ALL PHOTOS) */}
        <section
          id="photo"
          aria-labelledby="row-01-photo-heading"
          className="w-full px-[7px] pt-2"
        >
          {/* Minimal Section Header */}
          <div className="mb-2.5 flex items-center pt-2">
            <h2
              id="row-01-photo-heading"
              className="font-sans text-[12px] font-normal tracking-[-0.01em]"
              style={{ color: palette.ink }}
            >
              Photostory
            </h2>
          </div>

          {loadingPhotos ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-[260px] items-center justify-center"
            >
              <p
                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                style={{ color: palette.inkMuted }}
              >
                Loading photography archive...
              </p>
            </div>
          ) : photoError ? (
            <div
              role="alert"
              className="flex h-[220px] flex-col items-center justify-center gap-3 text-center"
            >
              <p
                className="font-mono text-[11.5px]"
                style={{ color: palette.inkSoft }}
              >
                Could not load photos right now.
              </p>
              <button
                type="button"
                onClick={fetchAllPhotos}
                className="cursor-pointer rounded-[2px] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em]"
                style={{
                  backgroundColor: palette.accent,
                  color: palette.accentInk,
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            /* Pure 2-Column Wide Landscape Swiss 0px Grid (No captions until clicked) */
            <div className="grid grid-cols-1 gap-[7px] sm:grid-cols-2">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIdx(idx)}
                  aria-label={`View ${photo.title}`}
                  data-cursor-label="view"
                  data-art-reveal
                  className="art-reveal group relative block aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-none text-left"
                  style={{
                    backgroundColor: palette.surface,
                    ['--reveal-delay' as string]: `${(idx % 2) * 80}ms`,
                  }}
                >
                  <Image
                    src={photo.image}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ROW 02: MEDIA PROD (SULAWESIPOS — MINIMAL OPEN-CANVAS SWISS SPLIT) */}
        <section
          id="media-production"
          aria-labelledby="row-02-media-heading"
          data-art-reveal
          onMouseEnter={() => setMediaPaused(true)}
          onMouseLeave={() => setMediaPaused(false)}
          className="art-reveal mt-20 w-full px-5 sm:px-8 lg:px-10"
        >
          <div className="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Open Typographic Column (Fixed Title & Description, Dynamic Platform Stats) */}
            <div className="flex max-w-[410px] flex-col lg:col-span-5">
              <h2
                id="row-02-media-heading"
                className="font-sans text-[15px] font-normal tracking-[-0.01em]"
                style={{ color: palette.inkSoft }}
              >
                {mediaShowcase.sectionLabel}
              </h2>

              <h3
                className="mt-9 font-sans text-[16px] font-normal tracking-[-0.01em]"
                style={{ color: palette.ink }}
              >
                {mediaShowcase.platforms.tiktok.title}
              </h3>

              <p
                className="mt-3 font-sans text-[15px] leading-[1.55] tracking-[-0.01em]"
                style={{ color: palette.inkSoft }}
              >
                {mediaShowcase.platforms.tiktok.description}
              </p>

              {/* Real Verified Engagement Stats Grid (Updates per Platform: Tiktok / Youtube) */}
              <div
                key={`stats-${activePlatform}`}
                className="mt-9 grid grid-cols-3 gap-x-6 gap-y-5 animate-in fade-in duration-300"
              >
                {platformData.metrics.map((metric) => (
                  <div key={metric.label} className="space-y-0.5">
                    <p
                      className="font-sans text-[15.5px] font-semibold leading-tight tabular-nums tracking-[-0.01em]"
                      style={{ color: palette.ink }}
                    >
                      {metric.value}
                    </p>
                    <p
                      className="font-sans text-[13px] font-normal leading-tight"
                      style={{ color: palette.inkSoft }}
                    >
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Centered Minimal Text Tabs (Tiktok / Youtube) + Compact Tall Portrait Box Fitting in 1 Screen */}
            <div className="flex w-full max-w-[340px] flex-col lg:col-span-4 lg:col-start-9 lg:ml-auto">
              <div
                role="tablist"
                aria-label="Select platform"
                className="mb-3 flex items-center justify-center gap-5 font-sans text-[14px] tracking-[-0.01em]"
              >
                {(['tiktok', 'youtube'] as MediaPlatformKey[]).map((key) => {
                  const isSelected = activePlatform === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => handleSelectPlatform(key)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        color: isSelected ? palette.ink : palette.inkMuted,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {mediaShowcase.platforms[key].label}
                    </button>
                  );
                })}
              </div>

              {/* Single Clickable Sharp 0px Channel Media Frame (Image or Video -> Custom URL) */}
              <a
                key={`media-${activePlatform}`}
                href={activeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${platformData.title} on ${platformData.label}`}
                className="group relative block aspect-[3/4] max-h-[68vh] w-full overflow-hidden rounded-none animate-in fade-in duration-300"
                style={{ backgroundColor: palette.surface }}
              >
                {activeMediaUrl ? (
                  activeMediaIsVideo ? (
                    <video
                      key={activeMediaUrl}
                      src={activeMediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <img
                      src={activeMediaUrl}
                      alt={`${platformData.title} ${platformData.label}`}
                      className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase text-[#7E7A72]">
                    No media
                  </div>
                )}
              </a>
            </div>
          </div>
        </section>

        {/* ROW 03: ORGANIZATION INSTAGRAM BRANDING (ARJUNA UH / KKNT ASSAMATURU — 3-COLUMN DIAGONAL SWISS SPLIT) */}
        <section
          id="brand-identity"
          aria-labelledby="row-03-branding-heading"
          data-art-reveal
          onMouseEnter={() => setOrgPaused(true)}
          onMouseLeave={() => setOrgPaused(false)}
          className="art-reveal mt-28 w-full px-5 sm:px-8 lg:px-10"
        >
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Top-Left Column: Account Handle & Overview (Updates per Active Org) */}
            <div
              key={`org-text-${activeOrg}`}
              className="flex max-w-[320px] flex-col animate-in fade-in duration-300 lg:col-span-4 lg:self-start lg:pt-8"
            >
              <h2
                id="row-03-branding-heading"
                className="font-sans text-[16px] font-normal tracking-[-0.01em]"
                style={{ color: palette.ink }}
              >
                {activeOrgData.handle}
              </h2>

              <p
                className="mt-3 font-sans text-[15px] leading-[1.55] tracking-[-0.01em]"
                style={{ color: palette.inkSoft }}
              >
                {activeOrgData.leftDescription}
              </p>
            </div>

            {/* Center Column: Minimal Switcher Tabs + Tall Sharp 0px Portrait Media Frame */}
            <div className="flex w-full flex-col items-center lg:col-span-4">
              <div
                role="tablist"
                aria-label="Select organization account"
                className="mb-3 flex items-center justify-center gap-5 font-sans text-[14px] tracking-[-0.01em]"
              >
                {(['arjuna', 'kknt'] as OrgBrandingKey[]).map((key) => {
                  const isSelected = activeOrg === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveOrg(key)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        color: isSelected ? palette.ink : palette.inkMuted,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {orgBranding.accounts[key].tabLabel}
                    </button>
                  );
                })}
              </div>

              <a
                key={`org-media-${activeOrg}`}
                href={activeOrgData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${activeOrgData.handle} on Instagram`}
                className="group relative block aspect-[3/4] max-h-[68vh] w-full max-w-[340px] overflow-hidden rounded-none animate-in fade-in duration-300"
                style={{ backgroundColor: palette.surface }}
              >
                {activeOrgData.mediaUrl ? (
                  orgMediaIsVideo ? (
                    <video
                      key={activeOrgData.mediaUrl}
                      src={activeOrgData.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <img
                      src={activeOrgData.mediaUrl}
                      alt={`${activeOrgData.handle} Instagram branding`}
                      className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase text-[#7E7A72]">
                    No media
                  </div>
                )}
              </a>
            </div>

            {/* Bottom-Right Column: Branding Philosophy Statement (Per-account or shared fallback) */}
            <div
              key={`org-right-${activeOrg}`}
              className="flex max-w-[340px] flex-col animate-in fade-in duration-300 lg:col-span-4 lg:ml-auto lg:self-end lg:pb-12"
            >
              <p
                className="font-sans text-[15px] leading-[1.55] tracking-[-0.01em]"
                style={{ color: palette.inkSoft }}
              >
                {activeOrgData.rightStatement || orgBranding.rightStatement}
              </p>
            </div>
          </div>
        </section>

        {/* ROW 04: IDENTITAS UNHAS (VIDEOS DUAL-SCREEN / DESIGN 4:5 GRID / DOCUMENTER 16:9 YOUTUBE) */}
        <section
          id="identitas-unhas"
          aria-labelledby="row-04-identitas-heading"
          data-art-reveal
          onMouseEnter={() => setVideoPaused(true)}
          onMouseLeave={() => setVideoPaused(false)}
          className="art-reveal mt-28 w-full px-5 sm:px-8 lg:px-10"
        >
          <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-10">
            {/* Left Stage (7 cols): Centered Mode Tabs + Active Mode Canvas */}
            <div className="flex w-full flex-col lg:col-span-7">
              {/* Centered Mode Tabs: Videos | Design | Documenter */}
              <div
                role="tablist"
                aria-label="Identitas Unhas work categories"
                className="mb-3.5 flex items-center justify-center gap-5 font-sans text-[14px] tracking-[-0.01em]"
              >
                {(
                  [
                    { key: 'videos', label: 'Videos' },
                    { key: 'design', label: 'Design' },
                    { key: 'documenter', label: 'Documenter' },
                  ] as Array<{ key: IdentitasModeKey; label: string }>
                ).map(({ key, label }) => {
                  const isSelected = identitasMode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setIdentitasMode(key)}
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      style={{
                        color: isSelected ? palette.ink : palette.inkMuted,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* MODE 1: VIDEOS — Dual Side-by-Side True 9:16 Vertical Screens (No Cropping) */}
              {identitasMode === 'videos' && (
                <div
                  key={`id-vids-${videoSlotAIdx}-${videoSlotBIdx}`}
                  className="flex w-full items-center justify-center gap-[10px] animate-in fade-in duration-300"
                >
                  {[videoSlotA, videoSlotB].filter(Boolean).map((vid, slotI) => {
                    if (!vid) return null;
                    const ytEmbed = toYouTubeEmbedUrl(vid.mediaUrl, {
                      autoplay: true,
                      mute: true,
                      loop: false,
                    });
                    const isDirectVideo = isVideoMediaUrl(vid.mediaUrl);
                    return (
                      <div
                        key={`${vid.id}-${slotI}`}
                        className="relative aspect-[9/16] w-1/2 overflow-hidden rounded-none sm:h-[66vh] sm:max-h-[620px] sm:w-auto"
                        style={{ backgroundColor: palette.surface }}
                      >
                        {ytEmbed ? (
                          <iframe
                            src={ytEmbed}
                            title={vid.title}
                            onLoad={(e) => {
                              try {
                                e.currentTarget.contentWindow?.postMessage(
                                  JSON.stringify({ event: 'listening' }),
                                  '*'
                                );
                              } catch {
                                // ignore cross-origin handshake errors
                              }
                            }}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        ) : isDirectVideo ? (
                          <video
                            src={vid.mediaUrl}
                            autoPlay
                            muted
                            playsInline
                            onEnded={() => {
                              advanceVideoSlot(slotI === 0 ? 0 : 1);
                            }}
                            className="block h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={vid.mediaUrl}
                            alt={vid.title}
                            className="block h-full w-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: DESIGN — Row 1 = Theme A Slides, Row 2 = Theme B Slides (4 full 4:5 + 1/4 faded peek for slide 5+) */}
              {identitasMode === 'design' && (
                <div
                  key={`id-des-pair-${designSlotAIdx}-${designSlotBIdx}`}
                  className="flex w-full flex-col gap-[7px] animate-in fade-in duration-300"
                >
                  {activeDesignRows.map(({ theme: des, themeIdx }) => {
                    const allSlides = [
                      des.image,
                      ...(des.extraImages || []),
                    ].filter(Boolean);
                    const mainSlides = allSlides.slice(0, 4);
                    const peekSlide =
                      allSlides.length > 4 ? allSlides[4] : null;
                    const extraCount = Math.max(0, allSlides.length - 4);

                    return (
                      <div
                        key={des.id}
                        className={`grid w-full gap-[7px] ${
                          peekSlide
                            ? 'grid-cols-[1fr_1fr_1fr_1fr_0.28fr]'
                            : 'grid-cols-4'
                        }`}
                      >
                        {mainSlides.map((slideUrl, sIdx) => (
                          <button
                            key={`${des.id}-slide-${sIdx}`}
                            type="button"
                            onClick={() => {
                              setTargetSlideIdx(sIdx);
                              setDesignLightboxIdx(themeIdx);
                            }}
                            aria-label={`View ${des.title} slide ${sIdx + 1}`}
                            className="group relative block aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-none text-left"
                            style={{ backgroundColor: palette.surface }}
                          >
                            <img
                              src={slideUrl}
                              alt={`${des.title} slide ${sIdx + 1}`}
                              loading="eager"
                              className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                            />
                          </button>
                        ))}

                        {/* 1/4-Width Faded Peek Slot when Theme has >4 Slides */}
                        {peekSlide && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetSlideIdx(4);
                              setDesignLightboxIdx(themeIdx);
                            }}
                            aria-label={`View ${extraCount} more slides in ${des.title}`}
                            className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-none text-left"
                            style={{ backgroundColor: palette.surface }}
                          >
                            <img
                              src={peekSlide}
                              alt={`${des.title} more slides`}
                              className="block h-full w-full object-cover object-left opacity-45 transition-opacity duration-300 group-hover:opacity-75"
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background: `linear-gradient(to right, transparent 0%, ${palette.bg} 95%)`,
                              }}
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 3: DOCUMENTER — Wide 16:9 YouTube Player Canvas */}
              {identitasMode === 'documenter' && (
                <div
                  key={`id-doc-${safeDocIdx}`}
                  className="relative aspect-video w-full overflow-hidden rounded-none animate-in fade-in duration-300"
                  style={{ backgroundColor: palette.surface }}
                >
                  {activeDoc && activeDocEmbedUrl ? (
                    <iframe
                      src={activeDocEmbedUrl}
                      title={activeDoc.title}
                      onLoad={(e) => {
                        try {
                          e.currentTarget.contentWindow?.postMessage(
                            JSON.stringify({ event: 'listening' }),
                            '*'
                          );
                        } catch {
                          // ignore cross-origin handshake errors
                        }
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : activeDoc && isVideoMediaUrl(activeDoc.youtubeUrl) ? (
                    <video
                      src={activeDoc.youtubeUrl}
                      controls
                      playsInline
                      onEnded={() => {
                        if (identitasDocs.length > 1) {
                          setActiveDocIdx(
                            (prev) => (prev + 1) % identitasDocs.length
                          );
                        }
                      }}
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase text-[#7E7A72]">
                      No documentary link set
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (4 cols): Identitas Unhas Overview + Interactive Queue Selector */}
            <div className="flex max-w-[360px] flex-col lg:col-span-4 lg:col-start-9 lg:pt-8">
              <h2
                id="row-04-identitas-heading"
                className="font-sans text-[16px] font-normal tracking-[-0.01em]"
                style={{ color: palette.ink }}
              >
                {identitasShowcase.title}
              </h2>

              <p
                className="mt-3 font-sans text-[15px] leading-[1.55] tracking-[-0.01em]"
                style={{ color: palette.inkSoft }}
              >
                {identitasShowcase.description}
              </p>

              {/* Draggable 01 / 02 Marker Queue List (Drag 01 or 02 onto any title to play on Screen/Row 1 or 2) */}
              <div className="mt-12 flex flex-col gap-2 font-sans text-[14px] leading-[1.45] tracking-[-0.01em]">
                {identitasMode === 'videos' &&
                  identitasVideos.map((vid, idx) => {
                    const markerSlot: 0 | 1 | null =
                      idx === videoSlotAIdx
                        ? 0
                        : identitasVideos.length > 1 && idx === videoSlotBIdx
                        ? 1
                        : null;
                    const isPlaying = markerSlot !== null;
                    const isDragTarget =
                      draggedMarker !== null && dragOverIdx === idx;
                    return (
                      <div
                        key={vid.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverIdx !== idx) setDragOverIdx(idx);
                        }}
                        onDragLeave={() => {
                          if (dragOverIdx === idx) setDragOverIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedMarker !== null) {
                            dropMarkerOnIndex('videos', draggedMarker, idx);
                          }
                          setDraggedMarker(null);
                          setDragOverIdx(null);
                        }}
                        className="flex items-center gap-2.5 py-0.5 transition-all"
                        style={{
                          borderLeft: isDragTarget
                            ? `2px solid ${palette.accent}`
                            : '2px solid transparent',
                          paddingLeft: isDragTarget ? '8px' : '0px',
                        }}
                      >
                        {markerSlot !== null && (
                          <span
                            draggable
                            onDragStart={(e) => {
                              setDraggedMarker(markerSlot);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData(
                                'text/plain',
                                String(markerSlot)
                              );
                            }}
                            onDragEnd={() => {
                              setDraggedMarker(null);
                              setDragOverIdx(null);
                            }}
                            title={`Geser 0${markerSlot + 1} ke judul lain untuk mengganti layar ${markerSlot + 1}`}
                            className="inline-flex shrink-0 cursor-grab select-none items-center rounded-none px-1.5 py-0.5 font-mono text-[10.5px] font-semibold leading-none tabular-nums active:cursor-grabbing"
                            style={{
                              backgroundColor: palette.accent,
                              color: palette.accentInk,
                            }}
                          >
                            0{markerSlot + 1}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => selectVideoIndependent(idx)}
                          className="min-w-0 flex-1 cursor-pointer truncate text-left transition-opacity hover:opacity-100"
                          style={{
                            color:
                              isPlaying || isDragTarget
                                ? palette.ink
                                : palette.inkMuted,
                            opacity: isPlaying || isDragTarget ? 1 : 0.42,
                          }}
                        >
                          {vid.title}
                        </button>
                      </div>
                    );
                  })}

                {identitasMode === 'design' &&
                  identitasDesigns.map((des, idx) => {
                    const markerSlot: 0 | 1 | null =
                      idx === designSlotAIdx
                        ? 0
                        : identitasDesigns.length > 1 && idx === designSlotBIdx
                        ? 1
                        : null;
                    const isShown = markerSlot !== null;
                    const isDragTarget =
                      draggedMarker !== null && dragOverIdx === idx;
                    return (
                      <div
                        key={des.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverIdx !== idx) setDragOverIdx(idx);
                        }}
                        onDragLeave={() => {
                          if (dragOverIdx === idx) setDragOverIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedMarker !== null) {
                            dropMarkerOnIndex('design', draggedMarker, idx);
                          }
                          setDraggedMarker(null);
                          setDragOverIdx(null);
                        }}
                        className="flex items-center gap-2.5 py-0.5 transition-all"
                        style={{
                          borderLeft: isDragTarget
                            ? `2px solid ${palette.accent}`
                            : '2px solid transparent',
                          paddingLeft: isDragTarget ? '8px' : '0px',
                        }}
                      >
                        {markerSlot !== null && (
                          <span
                            draggable
                            onDragStart={(e) => {
                              setDraggedMarker(markerSlot);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData(
                                'text/plain',
                                String(markerSlot)
                              );
                            }}
                            onDragEnd={() => {
                              setDraggedMarker(null);
                              setDragOverIdx(null);
                            }}
                            title={`Geser 0${markerSlot + 1} ke judul lain untuk mengganti baris ${markerSlot + 1}`}
                            className="inline-flex shrink-0 cursor-grab select-none items-center rounded-none px-1.5 py-0.5 font-mono text-[10.5px] font-semibold leading-none tabular-nums active:cursor-grabbing"
                            style={{
                              backgroundColor: palette.accent,
                              color: palette.accentInk,
                            }}
                          >
                            0{markerSlot + 1}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (isShown) {
                              setTargetSlideIdx(0);
                              setDesignLightboxIdx(idx);
                            } else {
                              selectDesignIndependent(idx);
                            }
                          }}
                          className="min-w-0 flex-1 cursor-pointer truncate text-left transition-opacity hover:opacity-100"
                          style={{
                            color:
                              isShown || isDragTarget
                                ? palette.ink
                                : palette.inkMuted,
                            opacity: isShown || isDragTarget ? 1 : 0.42,
                          }}
                        >
                          {des.title}
                        </button>
                      </div>
                    );
                  })}

                {identitasMode === 'documenter' &&
                  identitasDocs.map((doc, idx) => {
                    const isPlaying = idx === safeDocIdx;
                    const isDragTarget =
                      draggedMarker !== null && dragOverIdx === idx;
                    return (
                      <div
                        key={doc.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverIdx !== idx) setDragOverIdx(idx);
                        }}
                        onDragLeave={() => {
                          if (dragOverIdx === idx) setDragOverIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedMarker !== null) {
                            dropMarkerOnIndex('documenter', 0, idx);
                          }
                          setDraggedMarker(null);
                          setDragOverIdx(null);
                        }}
                        className="flex items-center gap-2.5 py-0.5 transition-all"
                        style={{
                          borderLeft: isDragTarget
                            ? `2px solid ${palette.accent}`
                            : '2px solid transparent',
                          paddingLeft: isDragTarget ? '8px' : '0px',
                        }}
                      >
                        {isPlaying && (
                          <span
                            draggable
                            onDragStart={(e) => {
                              setDraggedMarker(0);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', '0');
                            }}
                            onDragEnd={() => {
                              setDraggedMarker(null);
                              setDragOverIdx(null);
                            }}
                            title="Geser 01 ke judul lain untuk mengganti dokumenter"
                            className="inline-flex shrink-0 cursor-grab select-none items-center rounded-none px-1.5 py-0.5 font-mono text-[10.5px] font-semibold leading-none tabular-nums active:cursor-grabbing"
                            style={{
                              backgroundColor: palette.accent,
                              color: palette.accentInk,
                            }}
                          >
                            01
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveDocIdx(idx)}
                          className="min-w-0 flex-1 cursor-pointer truncate text-left transition-opacity hover:opacity-100"
                          style={{
                            color:
                              isPlaying || isDragTarget
                                ? palette.ink
                                : palette.inkMuted,
                            opacity: isPlaying || isDragTarget ? 1 : 0.42,
                          }}
                        >
                          {doc.title}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>

        {/* ROW 05: PRINT & OBJECTS (SWISS PRINT INDEX + STICKY LIVE PREVIEW STAGE) */}
        <section
          id="print-works"
          aria-labelledby="row-05-print-heading"
          data-art-reveal
          className="art-reveal mt-28 w-full px-5 sm:px-8 lg:px-10"
        >
          {/* Minimal Section Header + Filter Tabs (All / Magazine / Infographic / Product) */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2
              id="row-05-print-heading"
              className="font-sans text-[15px] font-normal tracking-[-0.01em]"
              style={{ color: palette.inkSoft }}
            >
              {printShowcase.sectionLabel}
            </h2>

            <div
              role="tablist"
              aria-label="Filter print works by category"
              className="flex flex-wrap items-center gap-5 font-sans text-[13.5px] tracking-[-0.01em]"
            >
              {(
                ['all', 'magazine', 'infographic', 'product'] as PrintFilterKey[]
              ).map((key) => {
                const isSelected = printFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setPrintFilter(key);
                      setActivePrintIdx(0);
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    style={{
                      color: isSelected ? palette.ink : palette.inkMuted,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {PRINT_CATEGORY_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asymmetric Split: Left Swiss Editorial Index Table | Right Sticky Live Preview */}
          <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-10">
            {/* Left Column (6 cols): Interactive Print Spec Index */}
            <div
              className="flex flex-col border-t lg:col-span-6"
              style={{ borderColor: palette.border }}
            >
              {filteredPrintItems.map((item, idx) => {
                const isActive = idx === safePrintIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActivePrintIdx(idx)}
                    onFocus={() => setActivePrintIdx(idx)}
                    onClick={() => {
                      setActivePrintIdx(idx);
                      setTargetSlideIdx(0);
                      setPrintLightboxIdx(idx);
                    }}
                    className="group grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b py-3.5 text-left transition-colors sm:grid-cols-[1fr_auto_auto]"
                    style={{ borderColor: palette.border }}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-[6px] w-[6px] shrink-0 rounded-none transition-opacity"
                        style={{
                          backgroundColor: palette.accent,
                          opacity: isActive ? 1 : 0,
                        }}
                      />
                      <span
                        className="truncate font-sans text-[15px] tracking-[-0.01em] transition-colors"
                        style={{
                          color: isActive ? palette.ink : palette.inkSoft,
                          fontWeight: isActive ? 500 : 400,
                        }}
                      >
                        {item.title}
                      </span>
                    </span>

                    <span
                      className="hidden font-mono text-[10.5px] uppercase tracking-[0.06em] sm:inline"
                      style={{
                        color: isActive ? palette.inkSoft : palette.inkMuted,
                      }}
                    >
                      {item.spec}
                    </span>

                    <span
                      className="font-mono text-[11px] tabular-nums"
                      style={{
                        color: isActive ? palette.ink : palette.inkMuted,
                      }}
                    >
                      {item.year}
                    </span>
                  </button>
                );
              })}

              {filteredPrintItems.length === 0 && (
                <p
                  className="py-10 font-mono text-[11px] uppercase tracking-[0.08em]"
                  style={{ color: palette.inkMuted }}
                >
                  No print works in this category yet.
                </p>
              )}
            </div>

            {/* Right Column (5 cols): Sticky Sharp 0px Live Preview Stage */}
            <div className="flex w-full flex-col lg:sticky lg:top-[52px] lg:col-span-5 lg:col-start-8">
              {activePrintItem && (
                <>
                  <button
                    key={activePrintItem.id}
                    type="button"
                    onClick={() => {
                      setTargetSlideIdx(0);
                      setPrintLightboxIdx(safePrintIdx);
                    }}
                    aria-label={`Open full detail of ${activePrintItem.title}`}
                    className="group relative block aspect-[4/3] max-h-[60vh] w-full cursor-pointer overflow-hidden rounded-none animate-in fade-in duration-200"
                    style={{ backgroundColor: palette.surface }}
                  >
                    <img
                      src={activePrintItem.image}
                      alt={activePrintItem.title}
                      className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    />
                  </button>

                  <div className="mt-2.5 flex items-baseline justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.06em]">
                    <span style={{ color: palette.inkSoft }}>
                      {PRINT_CATEGORY_LABELS[activePrintItem.category]} ·{' '}
                      {activePrintItem.spec}
                    </span>
                    <span
                      className="shrink-0 tabular-nums"
                      style={{ color: palette.inkMuted }}
                    >
                      {1 + (activePrintItem.extraImages?.length || 0)} FRAMES
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ROW 06: WRITING — RULED-NOTEBOOK JOURNAL GRID (CREATIVE ONLY, CENTERED FILTER) */}
        <section
          id="writing"
          aria-label="Creative writing archive"
          className="mt-28 w-full px-5 sm:px-8 lg:px-10"
        >
          {/* Centered Filter Tabs (All / Written / Edited) */}
          <div className="mb-8 flex items-center justify-center gap-6 font-sans text-[14px] tracking-[-0.01em]">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'written', label: 'Written' },
                { key: 'edited', label: 'Edited' },
              ] as const
            ).map(({ key, label }) => {
              const isSelected = writingFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setWritingFilter(key)}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    color: isSelected ? palette.ink : palette.inkMuted,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Full-Width 4-Column Ruled-Notebook Paper Cards Grid */}
          <div className="grid w-full grid-cols-2 gap-x-[8px] gap-y-[22px] sm:grid-cols-3 lg:grid-cols-4">
            {(writingFilter === 'all'
              ? articles
              : articles.filter((a) => a.role === writingFilter)
            ).map((article, aIdx) => {
              const lineColor = isDark
                ? 'rgba(242, 239, 233, 0.09)'
                : 'rgba(20, 20, 19, 0.1)';
              const paperBg = isDark ? '#101010' : '#F8F6F1';
              const href = `/art/writing/${encodeURIComponent(
                article.slug || article.id
              )}`;

              return (
                <Link
                  key={article.id}
                  href={href}
                  data-art-reveal
                  className="art-reveal group flex flex-col text-left"
                  style={{
                    ['--reveal-delay' as string]: `${(aIdx % 4) * 65}ms`,
                  }}
                >
                  <article
                    className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-none"
                    style={{
                      backgroundColor: paperBg,
                      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 21px, ${lineColor} 21px, ${lineColor} 22px)`,
                      backgroundPosition: '0 10px',
                    }}
                  >
                    {article.coverImage && (
                      <div
                        className="relative h-[42%] w-full shrink-0 overflow-hidden rounded-none"
                        style={{ backgroundColor: palette.surface }}
                      >
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          loading="lazy"
                          className="block h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    )}

                    <div
                      className={`flex flex-1 flex-col justify-between px-4 pb-4 ${
                        article.coverImage ? 'pt-3.5' : 'pt-10'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <h3
                          className="line-clamp-3 font-sans text-[14px] font-normal leading-[19.5px] tracking-[-0.015em] group-hover:underline group-hover:underline-offset-[2px]"
                          style={{ color: palette.ink }}
                        >
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p
                            className="line-clamp-3 font-sans text-[11px] leading-[16.5px] tracking-[-0.01em] opacity-60"
                            style={{ color: palette.inkMuted }}
                          >
                            {article.excerpt}
                          </p>
                        )}
                      </div>

                      <span
                        className="self-end font-sans text-[10px] leading-none tracking-[-0.01em]"
                        style={{ color: palette.inkSoft }}
                      >
                        {article.role === 'edited'
                          ? 'Edited by Adrian'
                          : '-Adrian'}
                      </span>
                    </div>
                  </article>

                  <span
                    className="mt-1.5 font-sans text-[10.5px] tracking-[-0.01em]"
                    style={{ color: palette.inkMuted }}
                  >
                    {article.date}
                  </span>
                </Link>
              );
            })}

              {writingFilter !== 'all' &&
                articles.filter((a) => a.role === writingFilter).length ===
                  0 && (
                  <p
                    className="col-span-full py-12 font-mono text-[11px] uppercase tracking-[0.08em]"
                    style={{ color: palette.inkMuted }}
                  >
                    Belum ada tulisan di kategori{' '}
                    {writingFilter === 'edited' ? 'Edited' : 'Written'}. Tandai
                    di /setting/articles.
                  </p>
                )}
          </div>
        </section>

        {/* Minimal Swiss Closing CTA (Opens About Page) */}
        <section
          aria-label="About and contact prompt"
          data-art-reveal
          className="art-reveal mt-28 w-full px-5 sm:px-8 lg:px-10"
        >
          <div className="flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-end">
            <div className="max-w-[460px] space-y-2">
              <p
                className="font-mono text-[10.5px] uppercase tracking-[0.12em]"
                style={{ color: palette.inkMuted }}
              >
                BEHIND THE ARCHIVE
              </p>
              <p
                className="font-sans text-[20px] font-normal leading-[1.3] tracking-[-0.02em] sm:text-[24px]"
                style={{ color: palette.ink }}
              >
                Curious about the process, experience, or working together?
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 font-sans text-[13px] uppercase tracking-[0.02em]">
              <Link
                href="/art/about"
                className="underline underline-offset-[4px] transition-opacity hover:opacity-75"
                style={{ color: palette.accent }}
              >
                ABOUT ADRIAN (DRI4N) →
              </Link>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="cursor-pointer transition-opacity hover:underline hover:underline-offset-[4px]"
                style={{
                  color: copiedEmail ? palette.accent : palette.inkMuted,
                }}
              >
                {copiedEmail ? 'EMAIL COPIED' : 'COPY EMAIL'}
              </button>
            </div>
          </div>
        </section>

        {/* Minimal Swiss Footer */}
        <footer
          className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t px-2.5 pt-5 font-sans text-[12px] uppercase tracking-[-0.34px] sm:px-3"
          style={{
            borderColor: palette.border,
            color: palette.inkMuted,
          }}
        >
          <span>© {new Date().getFullYear()} ADRIAN (DRI4N)</span>
          <span>MAKASSAR, ID · CREATIVE ARCHIVE</span>
        </footer>
      </main>

      {/* Asymmetric Split Editorial Detail View (Shared by Photostory & Identitas Design 4:5 Grid) */}
      {activeDetailItem && activeDetailIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detail view of ${activeDetailItem.title}`}
          className="fixed inset-x-0 bottom-0 top-[28px] z-40 overflow-y-auto"
          style={{
            backgroundColor: palette.bg,
            color: palette.ink,
          }}
        >
          {/* Floating Top-Right Square Close Button */}
          <button
            type="button"
            onClick={closeDetailSheet}
            aria-label="Close detail viewer"
            className="fixed right-2 top-[34px] z-50 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-none transition-colors"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
              color: palette.inkMuted,
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>

          {/* Asymmetric Split: Compact Left Rail + Full-Bleed Scrollable Multi-Image Right Stack */}
          <div className="grid w-full grid-cols-1 gap-4 pb-8 pt-1 lg:grid-cols-[205px_1fr] lg:gap-4 xl:grid-cols-[220px_1fr]">
            {/* Compact Sticky Left Editorial Sidebar */}
            <aside className="flex flex-col justify-between gap-6 px-2.5 pt-8 lg:sticky lg:top-[10px] lg:self-start lg:min-h-[calc(100vh-44px)] lg:pl-2.5 lg:pr-1">
              <div className="flex flex-col gap-2.5">
                <h2
                  className="font-sans text-[11.5px] font-normal leading-[1.3] tracking-[-0.01em]"
                  style={{ color: palette.ink }}
                >
                  {activeDetailItem.title}
                </h2>

                {/* Compact Sharp Tag Chips */}
                <div className="flex flex-wrap items-center gap-1">
                  {(activeDetailItem.tags && activeDetailItem.tags.length > 0
                    ? activeDetailItem.tags
                    : ['ARCHIVE']
                  ).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-none px-2 py-1 font-sans text-[9.5px] leading-none uppercase tracking-[0.04em]"
                      style={{
                        backgroundColor: palette.surface,
                        color: palette.inkSoft,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Compact Editorial Narrative */}
                <p
                  className="mt-1 whitespace-pre-line font-sans text-[10.5px] leading-[1.46] tracking-[-0.01em]"
                  style={{ color: palette.inkSoft }}
                >
                  {activeDetailItem.caption}
                </p>
              </div>

              {/* Minimal Bottom Item Stepper */}
              <div
                className="flex items-center justify-between border-t pt-2.5 font-mono text-[9.5px] uppercase tracking-[0.06em]"
                style={{
                  borderColor: palette.border,
                  color: palette.inkMuted,
                }}
              >
                <span className="tabular-nums">
                  {String(activeDetailIdx + 1).padStart(2, '0')} /{' '}
                  {String(activeDetailList.length).padStart(2, '0')}
                </span>

                {activeDetailList.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => stepDetailSheet(-1)}
                      aria-label="Previous item"
                      className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-none transition-colors"
                      style={{
                        backgroundColor: palette.surface,
                        border: `1px solid ${palette.border}`,
                        color: palette.ink,
                      }}
                    >
                      <ChevronLeft size={12} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepDetailSheet(1)}
                      aria-label="Next item"
                      className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-none transition-colors"
                      style={{
                        backgroundColor: palette.surface,
                        border: `1px solid ${palette.border}`,
                        color: palette.ink,
                      }}
                    >
                      <ChevronRight size={12} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </aside>

            {/* Full-Bleed Scrollable Right Visual Stack (1..N images in exact carousel order) */}
            <div className="flex w-full flex-col gap-[7px]">
              {[
                activeDetailItem.image,
                ...(activeDetailItem.extraImages || []),
              ]
                .filter(Boolean)
                .map((imgSrc, imgIdx) => (
                  <div
                    key={`${activeDetailItem.id}-img-${imgIdx}`}
                    id={`detail-slide-${imgIdx}`}
                    className="w-full overflow-hidden rounded-none"
                    style={{ backgroundColor: palette.surface }}
                  >
                    <img
                      src={imgSrc}
                      alt={`${activeDetailItem.title} frame ${imgIdx + 1}`}
                      loading={imgIdx <= targetSlideIdx + 1 ? 'eager' : 'lazy'}
                      className="block h-auto w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
