'use client';

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  startTransition,
} from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  GitBranch,
  Minus,
  Moon,
  Plus,
  Scissors,
  Sun,
  Trophy,
} from 'lucide-react';
import { ArtCursor, ScrambleKeychip } from '@/components/ArtCursor';
import SpotifyNowPlaying from '@/components/SpotifyNowPlaying';

const AgentBuilderIntro = dynamic(
  () => import('@/components/AgentBuilderIntro'),
  { ssr: false }
);
import SpotifyAmbientBackdrop, {
  SpotifyFooterCredit,
} from '@/components/SpotifyAmbientBackdrop';
import GitHubActivity from '@/components/GitHubActivity';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { techStack } from '@/data/techstack';
import { projects as staticProjects } from '@/data/projects';
import { articles as staticArticles } from '@/data/articles';
import { aboutData as staticAboutData } from '@/data/about';
import { workData as staticWorkData } from '@/data/experience';
import { achievementsData as staticAchievementsData } from '@/data/achievements';
import { ART_PATH } from '@/lib/sites';
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

type ActiveView = 'home' | 'work' | 'experience' | 'writing' | 'resources';

interface DevProject {
  id: string;
  title: string;
  slug?: string;
  category: string;
  year: string;
  image: string;
  description?: string;
  github?: string;
  demo?: string;
  stack?: string[];
}

interface ExperienceTicket {
  id: string;
  code: string;
  year: string;
  role: string;
  company: string;
  location: string;
  logoUrl?: string;
  desc: string;
  points?: string[];
  topics: [string, string, string];
  primaryIndex: 0 | 1 | 2;
}

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  date: string;
  img: string;
}

interface AchievementItem {
  id: string;
  title: string;
  event: string;
  year: string;
  desc: string;
}

const ART_PORTAL_SLIDES = [
  {
    id: 'art-1',
    label: 'Visual Identity & Posters',
    image:
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'art-2',
    label: 'Editorial & Print',
    image:
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'art-3',
    label: 'Motion & Reels',
    image:
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'art-4',
    label: 'Photography Archive',
    image:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
  },
];

const AVATAR_REACTIONS = [
  'yeah, that’s me 👋',
  'still me 🙃',
  'you can stop now',
  'alright, cut the dashed line below ↓',
];

const BOOK_SPINES = [
  { label: 'NEXT', bg: '#e8341c', fg: '#ffffff', h: 112, tilt: -2 },
  { label: 'TS', bg: '#ffd166', fg: '#171717', h: 126, tilt: 1 },
  { label: 'REACT', bg: '#2b2d42', fg: '#f1eee9', h: 104, tilt: -1 },
  { label: 'SUPA', bg: '#06d6a0', fg: '#141414', h: 120, tilt: 2 },
  { label: 'TAIL', bg: '#ef476f', fg: '#ffffff', h: 114, tilt: 0 },
  { label: 'NODE', bg: '#f1eee9', fg: '#171717', h: 128, tilt: -2 },
  { label: 'API', bg: '#3a86ff', fg: '#ffffff', h: 108, tilt: 1.5 },
  { label: 'SQL', bg: '#fb8500', fg: '#141414', h: 118, tilt: -1 },
  { label: 'GIT', bg: '#8338ec', fg: '#ffffff', h: 122, tilt: 1 },
  { label: 'UIUX', bg: '#264653', fg: '#f1eee9', h: 110, tilt: -1.5 },
  { label: 'EDGE', bg: '#e9c46a', fg: '#171717', h: 116, tilt: 0.5 },
  { label: 'SYS', bg: '#ff5a3d', fg: '#141414', h: 124, tilt: -1 },
];

const MONTH_MAP: Record<string, number> = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};

/**
 * Parse strings like "2026 — NOW", "FEB — JUN 2026", "JUN — SEP 2025", "FEB 2025 — 2026"
 * into decimal year start/end values for the horizontal Gantt timeline.
 */
function parsePeriodRange(period: string): {
  start: number;
  end: number;
  isCurrent: boolean;
} {
  const upper = (period || '').toUpperCase();
  const isCurrent = upper.includes('NOW') || upper.includes('PRESENT');
  const nowDecimal = 2026.9;

  const parts = upper.split(/—|-|–/).map((s) => s.trim());
  const yearsFound = upper.match(/\d{4}/g)?.map(Number) || [2025];
  const firstYear = yearsFound[0] || 2025;
  const lastYear = yearsFound[yearsFound.length - 1] || firstYear;

  const extractMonth = (segment: string, fallback: number) => {
    for (const [abbr, idx] of Object.entries(MONTH_MAP)) {
      if (segment.includes(abbr)) return idx;
    }
    return fallback;
  };

  const startMonth = parts[0] ? extractMonth(parts[0], 0) : 0;
  const endMonth = parts[1] ? extractMonth(parts[1], 11) : 11;

  const start = firstYear + startMonth / 12;
  const end = isCurrent
    ? nowDecimal
    : Math.max(start + 0.22, lastYear + (endMonth + 1) / 12);

  return { start, end, isCurrent };
}

function sortExperiencesNewestFirst(
  list: ExperienceTicket[]
): ExperienceTicket[] {
  return list
    .toSorted((a, b) => {
      const ra = parsePeriodRange(a.year);
      const rb = parsePeriodRange(b.year);
      if (ra.isCurrent !== rb.isCurrent) return ra.isCurrent ? -1 : 1;
      if (rb.end !== ra.end) return rb.end - ra.end;
      return rb.start - ra.start;
    })
    .map((item, idx) => ({
      ...item,
      code: String(idx + 1).padStart(2, '0'),
    }));
}

function sortAchievementsNewestFirst(
  list: AchievementItem[]
): AchievementItem[] {
  return list.toSorted((a, b) => {
    const ya = parseInt((a.year || '').match(/\d{4}/)?.[0] || '0', 10);
    const yb = parseInt((b.year || '').match(/\d{4}/)?.[0] || '0', 10);
    return yb - ya;
  });
}

function formatShortDate(iso?: string): string {
  if (!iso) return '19.11.26';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '19.11.26';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
    .format(d)
    .replace(/\//g, '.');
}

interface CommunityActivityItem {
  id: string;
  kind: 'organization' | 'volunteering';
  title: string;
  company: string;
  timeline: string;
  location?: string;
  description: string;
}

let devMemCache: {
  projects?: DevProject[];
  experiences?: ExperienceTicket[];
  achievements?: AchievementItem[];
  activities?: CommunityActivityItem[];
  articles?: ArticleItem[];
  artSlides?: { id: string; label: string; image: string }[];
} | null = null;

export default function DevPortfolioView({
  initialSettings,
}: {
  initialSettings?: Record<string, string>;
}) {
  const { settings } = useSiteSettings(initialSettings);

  // Theme (Default Dark #121212)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Active View synced with URL hash (#work, #experience, #writing, #services, #resources)
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [morphKey, setMorphKey] = useState<ActiveView | null>(null);
  const savedHomeScrollRef = useRef(0);

  // Avatar Easter-Egg
  const [avatarClicks, setAvatarClicks] = useState(0);

  // Drag-Along-the-Line Bio Cut (individual falling dashes + full 0% -> 100% cut)
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isHoveringCut, setIsHoveringCut] = useState(false);
  const [isDraggingCut, setIsDraggingCut] = useState(false);
  const [isAutoCutting, setIsAutoCutting] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);
  const [cutHoverPct, setCutHoverPct] = useState(8);
  const cutZoneRef = useRef<HTMLDivElement>(null);
  const cutStartXRef = useRef(0);
  const cutMaxProgressRef = useRef(0);
  const DASH_COUNT = 28;

  // Selected Projects Interactive Card Stack (120fps zero-re-render DOM-ref drag + auto-flip)
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [deckExiting, setDeckExiting] = useState<{
    id: string;
    dir: -1 | 1;
  } | null>(null);
  const [deckSettlingId, setDeckSettlingId] = useState<string | null>(null);
  const deckCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const deckDragXRef = useRef(0);
  const isDraggingDeckRef = useRef(false);
  const deckPointerRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    moved: boolean;
  }>({ active: false, startX: 0, startY: 0, moved: false });
  const deckJustDraggedRef = useRef(false);
  const deckExitTimerRef = useRef<number | null>(null);
  const deckSettleTimerRef = useRef<number | null>(null);
  const [activeSpineIdx, setActiveSpineIdx] = useState(3);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);

  // Tearable Ticket & Interactive Tech Stack Selection
  const [ticketTorn, setTicketTorn] = useState(false);
  const [ticketHovered, setTicketHovered] = useState(false);
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);

  const router = useRouter();
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [artSlides, setArtSlides] = useState(
    () => devMemCache?.artSlides || ART_PORTAL_SLIDES
  );
  const [artSlideIdx, setArtSlideIdx] = useState(0);
  const [activityGifIdx, setActivityGifIdx] = useState(0);

  const activityGifs = useMemo<string[]>(() => {
    if (!settings.activity_gifs) return [];
    try {
      const parsed = JSON.parse(settings.activity_gifs);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (u): u is string => typeof u === 'string' && u.trim().length > 0
        );
      }
    } catch {
      // ignore invalid json
    }
    return [];
  }, [settings.activity_gifs]);

  // Smooth 5-second cross-fade rotation across uploaded Activity GIFs
  useEffect(() => {
    if (activityGifs.length <= 1) {
      setActivityGifIdx(0);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActivityGifIdx((prev) => (prev + 1) % activityGifs.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activityGifs.length]);

  // Fast 2.4s cross-fade slideshow for the Creative Side preview tile on Home
  useEffect(() => {
    if (
      activeView !== 'home' ||
      artSlides.length <= 1 ||
      hoveredTile === 'art'
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setArtSlideIdx((prev) => (prev + 1) % artSlides.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [activeView, artSlides.length, hoveredTile]);

  const markImageBroken = (src: string) => {
    setBrokenImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };
  // Active Timeline Role, Pinch-to-Zoom, Competition Accordion, Resume Book & Copy
  const [expandedExpId, setExpandedExpId] = useState<string | null>(null);
  const [activePassId, setActivePassId] = useState<string | null>(null);
  const [passShuffleSeed, setPassShuffleSeed] = useState<number>(0);
  const [timelineZoom, setTimelineZoom] = useState<number>(1);
  const [isPinchingTimeline, setIsPinchingTimeline] = useState(false);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const timelineZoomRef = useRef<number>(1);
  const [activeAwardId, setActiveAwardId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Static fallbacks mapped to clean shapes
  const fallbackProjects: DevProject[] = useMemo(
    () =>
      staticProjects
        .filter((p) => p.mode === 'developer')
        .map((p, idx) => ({
          id: `static-${p.slug || idx}`,
          title: p.title,
          slug: p.slug,
          category: p.category || 'Engineering',
          year: p.yearRange || '2025',
          image:
            p.img ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          description: p.desc,
          github: p.github && p.github !== '#' ? p.github : undefined,
          stack: p.tags,
        })),
    []
  );

  const fallbackExperiences: ExperienceTicket[] = useMemo(
    () =>
      sortExperiencesNewestFirst(
        staticWorkData.map((w, idx) => ({
          id: `exp-${idx}`,
          code: String(idx + 1).padStart(2, '0'),
          year: w.year,
          role: w.role,
          company: w.company,
          location: w.location || 'Makassar, Indonesia',
          desc: w.desc,
          points: w.points,
          topics: ['TECH', 'SYSTEMS', 'WEB'] as [string, string, string],
          primaryIndex: (idx % 3) as 0 | 1 | 2,
        }))
      ),
    []
  );

  const fallbackAchievements: AchievementItem[] = useMemo(
    () =>
      sortAchievementsNewestFirst(
        staticAchievementsData.map((a, idx) => ({
          id: `ach-${idx}`,
          title: a.title,
          event: a.event,
          year: a.year,
          desc: a.desc,
        }))
      ),
    []
  );

  const fallbackArticles: ArticleItem[] = useMemo(
    () =>
      staticArticles.map((a) => ({
        id: `static-art-${a.id}`,
        title: a.title,
        slug: a.slug,
        category: a.category || 'Technology',
        excerpt: a.desc,
        date: a.date,
        img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      })),
    []
  );

  // Live Supabase state
  const [projects, setProjects] = useState<DevProject[]>(
    () => devMemCache?.projects || fallbackProjects
  );
  const [experiences, setExperiences] = useState<ExperienceTicket[]>(
    () => devMemCache?.experiences || fallbackExperiences
  );
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    () => devMemCache?.achievements || fallbackAchievements
  );
  const [activities, setActivities] = useState<CommunityActivityItem[]>(
    () => devMemCache?.activities || []
  );
  const [articles, setArticles] = useState<ArticleItem[]>(
    () => devMemCache?.articles || fallbackArticles
  );

  const devTools = useMemo(
    () => techStack.filter((t) => t.mode === 'developer'),
    []
  );

  const principles: string[] = useMemo(() => {
    try {
      return settings.about_principles
        ? JSON.parse(settings.about_principles)
        : staticAboutData.principles;
    } catch {
      return staticAboutData.principles;
    }
  }, [settings.about_principles]);

  const focusAreas: { title: string; desc: string }[] = useMemo(() => {
    try {
      return settings.about_focus
        ? JSON.parse(settings.about_focus)
        : staticAboutData.focus;
    } catch {
      return staticAboutData.focus;
    }
  }, [settings.about_focus]);

  // Sync theme with localStorage + document class
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    router.prefetch(ART_PATH);
    const readyCap = window.setTimeout(() => signalPortalRouteReady('/'), 420);
    const unsubscribeTheme = subscribeThemeStorage((next) => setTheme(next));
    return () => {
      window.clearTimeout(readyCap);
      unsubscribeTheme();
    };
  }, [router]);

  // Pre-warm detail pages when entering #work or #writing so portal transitions are instant
  useEffect(() => {
    if (activeView === 'work') {
      projects.slice(0, 8).forEach((p) => {
        if (p.slug) router.prefetch(`/projects/${p.slug}`);
      });
    } else if (activeView === 'writing') {
      articles.slice(0, 8).forEach((a) => {
        if (a.slug) router.prefetch(`/blog/${a.slug}`);
      });
    }
  }, [activeView, projects, articles, router]);

  const switchTheme = (
    next: 'dark' | 'light',
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (next === theme) return;
    setMorphKey(null);
    runThemeTransition(() => {
      setTheme(next);
      applyThemePreference(next);
    }, e);
  };

  // Persist & restore scroll position for EVERY view (home, work, experience, writing, resources)
  const saveScrollForView = (view: ActiveView) => {
    try {
      sessionStorage.setItem(`dev-scroll:${view}`, String(window.scrollY));
    } catch {
      // ignore storage errors
    }
  };

  const getSavedScrollForView = (view: ActiveView): number => {
    try {
      const raw = sessionStorage.getItem(`dev-scroll:${view}`);
      return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
    } catch {
      return 0;
    }
  };

  // Sync URL hash <-> activeView & restore saved scroll position (e.g. returning from /blog/[slug] or /projects/[slug])
  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace('#', '');
      const normalizedHash = rawHash === 'services' ? 'experience' : rawHash;
      const resolved: ActiveView = [
        'work',
        'experience',
        'writing',
        'resources',
      ].includes(normalizedHash)
        ? (normalizedHash as ActiveView)
        : 'home';
      setActiveView(resolved);
      const savedY = getSavedScrollForView(resolved);
      if (savedY > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
        });
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateTo = (view: ActiveView) => {
    if (view === activeView) return;

    // Save current view's scroll position before leaving
    saveScrollForView(activeView);
    if (activeView === 'home' && view !== 'home') {
      savedHomeScrollRef.current = window.scrollY;
    }

    const targetMorph: ActiveView | null =
      view !== 'home' ? view : activeView !== 'home' ? activeView : null;

    const targetScrollY =
      view === 'home'
        ? savedHomeScrollRef.current || getSavedScrollForView('home')
        : getSavedScrollForView(view);

    const applyNav = () => {
      flushSync(() => {
        setActiveView(view);
      });
      if (view === 'home') {
        window.history.pushState(null, '', window.location.pathname);
      } else {
        window.history.pushState(null, '', `#${view}`);
      }
      // Run scrollTo AFTER flushSync has committed the target DOM so scroll height isn't clamped!
      window.scrollTo({
        top: targetScrollY,
        behavior: 'instant' as ScrollBehavior,
      });
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!doc.startViewTransition || prefersReduced || !targetMorph) {
      applyNav();
      return;
    }

    // Tag the source tile BEFORE the browser captures the "old" snapshot
    flushSync(() => {
      setMorphKey(targetMorph);
    });

    document.documentElement.setAttribute('data-vt', 'nav');

    const vt = doc.startViewTransition(() => {
      applyNav();
    });

    vt.finished.finally(() => {
      setMorphKey(null);
      if (document.documentElement.getAttribute('data-vt') === 'nav') {
        document.documentElement.removeAttribute('data-vt');
      }
    });
  };

  // Global keyboard shortcuts (W, G, B, S, R, Esc)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'escape') {
        if (activeView !== 'home') {
          navigateTo('home');
        }
        return;
      }

      if (key === 'm') {
        switchTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      if (key === 'r' && settings.resume_url) {
        window.dispatchEvent(
          new CustomEvent('open-pdf-reader', {
            detail: {
              url: settings.resume_url,
              title: 'Resume - Adrian',
            },
          })
        );
        return;
      }

      if (activeView === 'home') {
        if (key === 's') navigateTo('work');
        else if (key === 'c') navigateWithCirclePortal(ART_PATH, router);
        else if (key === 'w') navigateTo('writing');
        else if (key === 't') navigateTo('experience');
        else if (key === 'a') navigateTo('resources');
      } else if (
        activeView === 'experience' &&
        key === 'enter' &&
        activities.length > 0 &&
        target?.tagName !== 'BUTTON' &&
        target?.tagName !== 'A'
      ) {
        e.preventDefault();
        setPassShuffleSeed((s) => s + 1);
        setActivePassId((prevId) => {
          const curIdx = Math.max(
            0,
            activities.findIndex((a) => a.id === prevId)
          );
          return activities[(curIdx + 1) % activities.length].id;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeView, router, activities, theme, settings.resume_url]);

  // Zero idle background timers for crisp, lightweight performance

  // Fetch ALL live Supabase data for the Main/Dev Portfolio (cached in memory across navigations)
  useEffect(() => {
    if (devMemCache) {
      signalPortalRouteReady('/');
      return;
    }

    async function loadDevData() {
      try {
        const [
          projectsRes,
          articlesRes,
          expRes,
          achRes,
          galleryRes,
          orgsRes,
          volsRes,
        ] = await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('experiences')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('achievements')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('volunteers')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

        const waitUntilIntroIdle = () =>
          new Promise<void>((resolve) => {
            if (
              typeof document === 'undefined' ||
              document.documentElement.getAttribute('data-agent-building') !==
                'true'
            ) {
              resolve();
              return;
            }
            let settled = false;
            const done = () => {
              if (settled) return;
              settled = true;
              observer.disconnect();
              window.clearTimeout(cap);
              resolve();
            };
            const observer = new MutationObserver(() => {
              if (
                document.documentElement.getAttribute('data-agent-building') !==
                'true'
              ) {
                done();
              }
            });
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['data-agent-building'],
            });
            const cap = window.setTimeout(done, 2100);
          });

        // Wait for the 120fps opening cursor animation to finish before committing heavy 7-table React state updates
        await waitUntilIntroIdle();

        const nextCache: NonNullable<typeof devMemCache> = {};

        startTransition(() => {
        if (galleryRes.data?.length) {
          const validPhotos = galleryRes.data
            .filter((g: any) => g.image_url)
            .map((g: any, idx: number) => ({
              id: `gal-slide-${g.id || idx}`,
              label: g.caption || g.title || 'Creative Side',
              image: g.image_url,
            }));
          if (validPhotos.length > 0) {
            setArtSlides(validPhotos);
            nextCache.artSlides = validPhotos;
          }
        }

        if (projectsRes.data?.length) {
          const devProjects: DevProject[] = projectsRes.data
            .filter(
              (p: any) => (p.mode?.toLowerCase() || 'developer') === 'developer'
            )
            .map((p: any) => ({
              id: String(p.id),
              title: p.title,
              slug: p.slug,
              category: p.category || 'Engineering',
              year: p.year_range || '2026',
              image:
                p.image_url ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
              description: p.description,
              github:
                p.github_url && p.github_url !== '#' ? p.github_url : undefined,
              demo: p.demo_url && p.demo_url !== '#' ? p.demo_url : undefined,
              stack: Array.isArray(p.stack)
                ? p.stack
                : typeof p.stack === 'string'
                ? p.stack
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                : [],
            }));
          if (devProjects.length > 0) {
            setProjects(devProjects);
            nextCache.projects = devProjects;
          }
        }

        if (articlesRes.data?.length) {
          const devOnlyArticles = articlesRes.data.filter((a: any) => {
            const tagsText = Array.isArray(a.tags)
              ? a.tags.join(' ')
              : String(a.tags || '');
            const hay = `${a.category || ''} ${tagsText}`.toLowerCase();
            return !hay.includes('creative');
          });
          const mappedArticles = devOnlyArticles.map((a: any) => ({
            id: String(a.id),
            title: a.title,
            slug: a.slug,
            category: a.category || 'Technology',
            excerpt:
              a.description ||
              a.excerpt ||
              a.desc ||
              (typeof a.content === 'string'
                ? a.content.replace(/<[^>]+>/g, '').replace(/[#*_`>\[\]()]/g, '').slice(0, 130) + '…'
                : 'Thoughts on engineering, design, and creative systems.'),
            date: a.date || formatShortDate(a.created_at),
            img:
              a.img ||
              'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
          }));
          setArticles(mappedArticles);
          nextCache.articles = mappedArticles;
        }

        if (expRes.data?.length) {
          const sortedExp = sortExperiencesNewestFirst(
            expRes.data.map((e: any, idx: number) => {
              const rawDesc = e.description || e.desc || '';
              const logoMatch = rawDesc.match(/<!-- LOGO_URL:\s*(.*?)\s*-->/);
              const logoUrl =
                e.logo_url || (logoMatch ? logoMatch[1] : undefined);
              const cleanDesc = rawDesc
                .replace(/<!-- LOGO_URL:\s*(.*?)\s*-->/, '')
                .trim();

              return {
                id: String(e.id),
                code: String(idx + 1).padStart(2, '0'),
                year: e.timeline || e.year || e.period || '2026',
                role: e.title || e.role || 'Role',
                company: e.company || e.organization || '',
                location: e.location || 'Makassar, Indonesia',
                logoUrl,
                desc: cleanDesc,
                points: Array.isArray(e.points) ? e.points : undefined,
                topics: ['DEV', 'SYSTEMS', 'ROLE'] as [
                  string,
                  string,
                  string,
                ],
                primaryIndex: (idx % 3) as 0 | 1 | 2,
              };
            })
          );
          setExperiences(sortedExp);
          nextCache.experiences = sortedExp;
        }

        if (achRes.data?.length) {
          const sortedAch = sortAchievementsNewestFirst(
            achRes.data.map((a: any) => ({
              id: String(a.id),
              title: a.title,
              event: a.event || a.issuer || 'Award',
              year: a.year || '2025',
              desc: a.description || a.desc || '',
            }))
          );
          setAchievements(sortedAch);
          nextCache.achievements = sortedAch;
        }

        const rawOrgs = Array.isArray(orgsRes.data) ? orgsRes.data : [];
        const rawVols = Array.isArray(volsRes.data) ? volsRes.data : [];
        if (rawOrgs.length > 0 || rawVols.length > 0) {
          const dedupMap = new Map<string, CommunityActivityItem>();
          const pushItem = (
            row: any,
            kind: 'organization' | 'volunteering'
          ) => {
            const title = String(row.title || '').trim();
            const company = String(row.company || '').trim();
            if (!title) return;
            const normKey = `${kind}:${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const cleanDesc = String(row.description || '')
              .replace(/<[^>]+>/g, '')
              .replace(/<!--[\s\S]*?-->/g, '')
              .trim();
            const loc = String(row.location || '').trim();
            const existing = dedupMap.get(normKey);
            if (!existing) {
              dedupMap.set(normKey, {
                id: `${kind}-${row.id}`,
                kind,
                title,
                company,
                timeline: String(row.timeline || '2025').trim(),
                location: loc || undefined,
                description: cleanDesc,
              });
            } else if (!existing.location && loc) {
              existing.location = loc;
            }
          };

          rawOrgs.forEach((r: any) => pushItem(r, 'organization'));
          rawVols.forEach((r: any) => pushItem(r, 'volunteering'));

          const scoreTimeline = (t: string) => {
            const up = t.toUpperCase();
            if (up.includes('NOW') || up.includes('PRESENT')) return 9999;
            const years = up.match(/20\d{2}/g);
            return years ? Math.max(...years.map(Number)) : 2020;
          };

          const mergedActivities = Array.from(dedupMap.values()).sort(
            (a, b) => scoreTimeline(b.timeline) - scoreTimeline(a.timeline)
          );
          setActivities(mergedActivities);
          nextCache.activities = mergedActivities;
        }
        });

        if (Object.keys(nextCache).length > 0) {
          devMemCache = nextCache;
        }
      } catch (err) {
        console.warn('DevPortfolioView Supabase fallback:', err);
      } finally {
        signalPortalRouteReady('/');
      }
    }

    loadDevData();
  }, []);

  const finishCutAndExpand = () => {
    setIsDraggingCut(false);
    setCutProgress(1);
    cutMaxProgressRef.current = 1;
    setIsDraggingCut(false);
    if (typeof document !== 'undefined') {
      document.documentElement.style.userSelect = '';
      document.documentElement.style.webkitUserSelect = '';
      window.getSelection()?.removeAllRanges();
    }
    // Brief beat so the final falling dashes cascade down before the bio unfolds
    setTimeout(() => {
      setBioExpanded(true);
      setIsAutoCutting(false);
      if (typeof window !== 'undefined') {
        window.getSelection()?.removeAllRanges();
      }
    }, 260);
  };

  const runAutoSweepCut = () => {
    if (isAutoCutting || bioExpanded) return;
    setIsAutoCutting(true);
    const startVal = cutMaxProgressRef.current;
    const duration = 420;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const next = startVal + (1 - startVal) * eased;
      cutMaxProgressRef.current = next;
      setCutProgress(next);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        finishCutAndExpand();
      }
    };
    requestAnimationFrame(step);
  };

  // Drag-along-the-line bio cut handlers (requires reaching the end >= 95%!)
  const updateCutFromClientX = (clientX: number) => {
    const rect = cutZoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const next = Math.max(cutMaxProgressRef.current, ratio);
    cutMaxProgressRef.current = next;
    setCutProgress(next);
    if (next >= 0.95) {
      finishCutAndExpand();
    }
  };

  const releaseCutDrag = () => {
    setIsDraggingCut(false);
    if (typeof document !== 'undefined') {
      document.documentElement.style.userSelect = '';
      document.documentElement.style.webkitUserSelect = '';
    }
  };

  const handleCutPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (bioExpanded || isAutoCutting) return;
    e.preventDefault();
    if (typeof document !== 'undefined') {
      document.documentElement.style.userSelect = 'none';
      document.documentElement.style.webkitUserSelect = 'none';
      window.getSelection()?.removeAllRanges();
    }
    setIsDraggingCut(true);
    cutStartXRef.current = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore pointer capture failure on synthetic events
    }
    updateCutFromClientX(e.clientX);
  };

  const handleCutPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (bioExpanded || isAutoCutting) return;
    const rect = cutZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const pct = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
      setCutHoverPct(pct);
    }
    if (!isDraggingCut) return;
    e.preventDefault();
    updateCutFromClientX(e.clientX);
  };

  const handleCutPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCut) return;
    releaseCutDrag();
    const movedPx = Math.abs(e.clientX - cutStartXRef.current);
    if (cutMaxProgressRef.current >= 0.95) {
      finishCutAndExpand();
    } else if (movedPx < 8) {
      // Quick click triggers a full left-to-right animated scissor sweep!
      runAutoSweepCut();
    }
    // If user stopped midway while dragging, keep the cut dashes where they stopped so they can continue to the end!
  };

  const emailAddress = settings.email_address || 'contact@dri4n.com';
  const githubUrl = settings.github_url || 'https://github.com/Adrianbahri';
  const linkedinUrl =
    settings.linkedin_url || 'https://linkedin.com/in/adrianbahri';
  const instagramUrl =
    settings.instagram_url || 'https://instagram.com/adrianbahri';
  const statusText = settings.site_status || 'Open for Collaboration';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  const deckProjects = projects.length > 0 ? projects : fallbackProjects;
  const safeActiveProjectIdx =
    deckProjects.length > 0 ? activeProjectIdx % deckProjects.length : 0;
  const currentProjectPreview =
    deckProjects[safeActiveProjectIdx] || fallbackProjects[0];

  const flipDeckCard = useCallback(
    (step: 1 | -1, exitDir: -1 | 1) => {
      if (deckProjects.length <= 1) return;
      const current = deckProjects[safeActiveProjectIdx];
      if (deckExitTimerRef.current) {
        window.clearTimeout(deckExitTimerRef.current);
      }
      if (deckSettleTimerRef.current) {
        window.clearTimeout(deckSettleTimerRef.current);
      }
      if (current) {
        setDeckExiting({ id: current.id, dir: exitDir });
      }
      setActiveProjectIdx(
        (prev) => (prev + step + deckProjects.length) % deckProjects.length
      );
      deckDragXRef.current = 0;
      isDraggingDeckRef.current = false;
      deckExitTimerRef.current = window.setTimeout(() => {
        setDeckExiting(null);
        if (current) {
          setDeckSettlingId(current.id);
          deckSettleTimerRef.current = window.setTimeout(() => {
            setDeckSettlingId(null);
          }, 40);
        }
      }, 360);
    },
    [deckProjects, safeActiveProjectIdx]
  );

  // Auto-flip Selected Projects deck gently like turning sheets (pauses on hover/drag/sub-views)
  useEffect(() => {
    if (
      activeView !== 'home' ||
      deckProjects.length <= 1 ||
      hoveredTile === 'work'
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      if (!isDraggingDeckRef.current) {
        flipDeckCard(1, -1);
      }
    }, 3600);
    return () => window.clearInterval(timer);
  }, [activeView, deckProjects.length, hoveredTile, flipDeckCard]);

  useEffect(() => {
    return () => {
      if (deckExitTimerRef.current) {
        window.clearTimeout(deckExitTimerRef.current);
      }
      if (deckSettleTimerRef.current) {
        window.clearTimeout(deckSettleTimerRef.current);
      }
    };
  }, []);

  const applyDeckDragStyles = (dx: number, animateBack = false) => {
    const total = deckProjects.length;
    if (total === 0) return;
    const frontProj = deckProjects[safeActiveProjectIdx];
    const secondProj = total > 1 ? deckProjects[(safeActiveProjectIdx + 1) % total] : null;
    const thirdProj = total > 2 ? deckProjects[(safeActiveProjectIdx + 2) % total] : null;

    const frontEl = frontProj ? deckCardRefs.current[frontProj.id] : null;
    const secondEl = secondProj ? deckCardRefs.current[secondProj.id] : null;
    const thirdEl = thirdProj ? deckCardRefs.current[thirdProj.id] : null;

    const spread = hoveredTile === 'work' ? 1 : 0;
    const p = Math.min(1, Math.abs(dx) / 96);
    const trans = animateBack
      ? 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease'
      : 'none';

    if (frontEl) {
      frontEl.style.transition = trans;
      frontEl.style.transform = animateBack
        ? spread
          ? 'translate3d(0px, -3px, 0) rotate(0deg) scale(1.015)'
          : 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)'
        : `translate3d(${dx.toFixed(1)}px, ${(Math.abs(dx) * 0.05).toFixed(1)}px, 0) rotate(${(dx * 0.08).toFixed(2)}deg)`;
    }
    if (secondEl) {
      const tx = (7 + spread * 4) * (1 - p);
      const ty = (-6 - spread * 3) * (1 - p);
      const rot = (1.6 + spread * 0.9) * (1 - p);
      const sc = 0.97 + 0.03 * p;
      secondEl.style.transition = trans;
      secondEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      secondEl.style.opacity = (0.78 + 0.22 * p).toFixed(3);
    }
    if (thirdEl) {
      const tx = (14 + spread * 7) * (1 - p * 0.45);
      const ty = (-12 - spread * 5) * (1 - p * 0.45);
      const rot = (3.1 + spread * 1.4) * (1 - p * 0.45);
      thirdEl.style.transition = trans;
      thirdEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(0.94)`;
      thirdEl.style.opacity = (0.52 + 0.18 * p).toFixed(3);
    }
  };

  const handleDeckPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (deckProjects.length <= 1) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    deckDragXRef.current = 0;
    deckPointerRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  };

  const handleDeckPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!deckPointerRef.current.active) return;
    const dx = e.clientX - deckPointerRef.current.startX;
    const dy = e.clientY - deckPointerRef.current.startY;

    if (!deckPointerRef.current.moved) {
      if (Math.abs(dx) > 3 && Math.abs(dx) >= Math.abs(dy) * 0.8) {
        deckPointerRef.current.moved = true;
        isDraggingDeckRef.current = true;
      } else {
        return;
      }
    }

    const clamped = Math.max(-155, Math.min(155, dx));
    deckDragXRef.current = clamped;
    applyDeckDragStyles(clamped, false);
  };

  const handleDeckPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!deckPointerRef.current.active) return;
    const wasMoved = deckPointerRef.current.moved;
    const finalDx = deckDragXRef.current;
    deckPointerRef.current.active = false;
    isDraggingDeckRef.current = false;
    deckDragXRef.current = 0;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not captured
    }

    if (wasMoved) {
      deckJustDraggedRef.current = true;
      window.setTimeout(() => {
        deckJustDraggedRef.current = false;
      }, 150);

      if (finalDx <= -34) {
        flipDeckCard(1, -1);
      } else if (finalDx >= 34) {
        flipDeckCard(-1, 1);
      } else {
        applyDeckDragStyles(0, true);
      }
    }
  };

  useEffect(() => {
    timelineZoomRef.current = timelineZoom;
  }, [timelineZoom]);

  // Native Pinch-to-Zoom for Career Timeline (Trackpad ctrl+wheel + Safari gesture + 2-finger touch)
  // Prevents browser viewport zoom and keeps the focal point smoothly anchored while scrolling inside the fixed box
  useEffect(() => {
    if (activeView !== 'experience') return;
    const el = timelineScrollRef.current;
    if (!el) return;

    let pinchEndTimer: number | null = null;
    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchAnchorRatio = 0.5;
    let touchMidX = 0;

    const applyAnchoredZoom = (
      nextZoom: number,
      focalClientX: number,
      ratioOverride?: number
    ) => {
      const clamped = Math.max(0.75, Math.min(2.5, nextZoom));
      const rect = el.getBoundingClientRect();
      const pointerX = Math.max(0, Math.min(rect.width, focalClientX - rect.left));
      const prevWidth = el.scrollWidth || rect.width;
      const ratio =
        ratioOverride !== undefined
          ? ratioOverride
          : (el.scrollLeft + pointerX) / prevWidth;

      timelineZoomRef.current = clamped;
      setIsPinchingTimeline(true);
      setTimelineZoom(clamped);

      requestAnimationFrame(() => {
        const newWidth = el.scrollWidth || rect.width;
        el.scrollLeft = Math.max(0, ratio * newWidth - pointerX);
      });

      if (pinchEndTimer) window.clearTimeout(pinchEndTimer);
      pinchEndTimer = window.setTimeout(() => {
        setIsPinchingTimeline(false);
      }, 140);
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      const factor = Math.exp(-e.deltaY * 0.0085);
      applyAnchoredZoom(timelineZoomRef.current * factor, e.clientX);
    };

    const onGesture = (e: Event) => {
      e.preventDefault();
    };

    const getTouchDist = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = getTouchDist(t1, t2) || 1;
        touchStartZoom = timelineZoomRef.current;
        touchMidX = (t1.clientX + t2.clientX) / 2;
        const rect = el.getBoundingClientRect();
        const pointerX = Math.max(0, Math.min(rect.width, touchMidX - rect.left));
        touchAnchorRatio =
          (el.scrollLeft + pointerX) / (el.scrollWidth || rect.width);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = getTouchDist(t1, t2);
        const midX = (t1.clientX + t2.clientX) / 2;
        const scale = curDist / touchStartDist;
        applyAnchoredZoom(touchStartZoom * scale, midX, touchAnchorRatio);
      }
    };

    const onTouchEnd = () => {
      if (touchStartDist > 0) {
        touchStartDist = 0;
        setIsPinchingTimeline(false);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGesture, { passive: false });
    el.addEventListener('gesturechange', onGesture, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      if (pinchEndTimer) window.clearTimeout(pinchEndTimer);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGesture);
      el.removeEventListener('gesturechange', onGesture);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeView]);

  const currentArtSlide = ART_PORTAL_SLIDES[0];

  const latestArticle = articles[0] || {
    id: 'default-art',
    title: 'Building Meaningful Digital Experiences',
    slug: '',
    category: 'Engineering',
    excerpt:
      'Notes on Next.js architecture, creative technology, UI/UX craft, and building intelligent systems through code.',
    date: '19.11.26',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  };

  const ThemeToggle = () => (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="relative inline-flex h-[28px] w-[54px] items-center rounded-full p-[3px]"
      style={{
        backgroundColor: 'var(--art-tile)',
        border: '1px solid var(--art-line)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute left-[3px] top-[3px] h-[20px] w-[22px] rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0px)',
          backgroundColor: 'var(--art-ground)',
          border: '1px solid var(--art-hairline-strong)',
        }}
      />
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'light'}
        aria-label="Light mode"
        onClick={(e) => switchTheme('light', e)}
        className="relative z-10 flex h-full w-1/2 items-center justify-center transition-opacity cursor-pointer"
        style={{
          color: theme === 'light' ? 'var(--art-ink)' : 'var(--art-ink-muted)',
        }}
      >
        <Sun size={12} aria-hidden="true" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === 'dark'}
        aria-label="Dark mode"
        onClick={(e) => switchTheme('dark', e)}
        className="relative z-10 flex h-full w-1/2 items-center justify-center transition-opacity cursor-pointer"
        style={{
          color: theme === 'dark' ? 'var(--art-ink)' : 'var(--art-ink-muted)',
        }}
      >
        <Moon size={12} aria-hidden="true" />
      </button>
    </div>
  );

  const SubViewTopBar = ({ sectionLabel }: { sectionLabel: string }) => (
    <div
      className="sticky top-0 z-40 w-full backdrop-blur-md"
      style={{
        backgroundColor: 'transparent',
        borderBottom: '1px solid var(--art-hairline)',
      }}
    >
      <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--art-tile)',
            color: 'var(--art-ink)',
            border: '1px solid var(--art-line)',
          }}
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span>Back</span>
        </button>

        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--art-ink-muted)' }}
        >
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="opacity-75 transition-opacity hover:opacity-100 cursor-pointer"
          >
            INDEX
          </button>
          <span aria-hidden="true">/</span>
          <span aria-current="page" style={{ color: 'var(--art-ink)' }}>{sectionLabel}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-block rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{
              backgroundColor: 'var(--art-tile)',
              color: 'var(--art-ink-muted)',
              border: '1px solid var(--art-line)',
            }}
          >
            Esc
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div
      data-dev-theme={theme}
      className="dev-shell art-custom-cursor-active relative w-full selection:bg-[#ff5a3d] selection:text-[#141414]"
    >
      <ArtCursor enableDebris={activeView === 'home'} />
      <AgentBuilderIntro active={activeView === 'home'} />
      <SpotifyAmbientBackdrop />

      <div className="relative z-10">
          {/* =================================================================
              HOME VIEW (560px Centered Single Reading Column — dri4n.com)
          ================================================================== */}
          {activeView === 'home' && (
            <main
              id="main-content"
              key="dev-home"
              className="mx-auto max-w-[560px] px-4 pb-16 pt-6 sm:px-0 sm:pb-20 sm:pt-[14vh]"
            >
              <div data-agent-slot="hero">
              {/* Top Row: Avatar + Easter-Egg + Prominent Resume CV + Segmented Theme Toggle */}
              <header className="flex items-center justify-between gap-2 pb-5 pt-1 sm:items-start sm:pb-6 sm:pt-[2vh]">
                <div className="flex items-center gap-3 sm:gap-3.5">
                  <button
                    type="button"
                    onClick={() => setAvatarClicks((c) => c + 1)}
                    aria-label="Adrian portrait"
                    className="group relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-[13px] transition-transform duration-200 hover:scale-[1.06] active:scale-[0.98] sm:h-[60px] sm:w-[60px] sm:rounded-[15px]"
                    style={{
                      backgroundColor: 'var(--art-tile)',
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    <Image
                      src={
                        settings.hero_image ||
                        '/api/assets/uploads/profile-fallback.webp'
                      }
                      alt="Adrian"
                      fill
                      priority
                      sizes="60px"
                      className="object-cover"
                    />
                  </button>

                  <div aria-live="polite" className="min-h-[20px]">
                    <AnimatePresence mode="wait">
                      {avatarClicks > 0 && (
                        <motion.span
                          key={avatarClicks}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block font-mono text-[11px] leading-[16px]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          {
                            AVATAR_REACTIONS[
                              (avatarClicks - 1) % AVATAR_REACTIONS.length
                            ]
                          }
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {settings.resume_url && (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-pdf-reader', {
                            detail: {
                              url: settings.resume_url,
                              title: 'Resume - Adrian',
                            },
                          })
                        )
                      }
                      className="group inline-flex h-[28px] items-center gap-1.5 rounded-full px-3 font-mono text-[11px] font-medium tracking-[0.04em] transition-all duration-200 hover:-translate-y-[1px]"
                      style={{
                        backgroundColor: 'var(--art-marker-tint)',
                        color: 'var(--art-marker-text)',
                        border: '1px solid var(--art-marker)',
                      }}
                    >
                      <FileText size={12} />
                      <span>Resume CV</span>
                      <ArrowUpRight
                        size={11}
                        className="transition-transform duration-200 group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
                      />
                    </button>
                  )}
                  <ThemeToggle />
                </div>
              </header>

              {/* Editorial Dev Bio (2-Section Editable from /setting: Before Cut & After Cut) */}
              {(() => {
                const defaultBefore = `Hey there, I'm Adrian (Dri4n)\na creative technologist & full-stack developer based in [strike:labs, late-night commits,] Makassar\n\nBy day I build digital systems & data workflows at [blue:PK Identitas Unhas], and modernize web platforms as an intern at [orange:UKK Sains Unhas].\n\nI love crafting fast, expressive [pink:full-stack web apps] with Next.js, TypeScript, and Bun + SQLite.`;

                const rawBefore =
                  settings.bio_before_cut !== undefined &&
                  settings.bio_before_cut.trim() !== ''
                    ? settings.bio_before_cut
                    : settings.hero_greeting || settings.hero_bio_1
                    ? [
                        `${settings.hero_greeting || "Hey there, I'm Adrian (Dri4n)"}\n${
                          settings.hero_subtitle ||
                          'a creative technologist & full-stack developer based in'
                        } ${
                          settings.hero_strike
                            ? `[strike:${settings.hero_strike}] `
                            : ''
                        }${settings.hero_city || 'Makassar'}`,
                        settings.hero_bio_1 || '',
                        settings.hero_bio_2 || '',
                      ]
                        .filter(Boolean)
                        .join('\n\n')
                    : defaultBefore;

                const rawAfter =
                  settings.bio_after_cut !== undefined &&
                  settings.bio_after_cut.trim() !== ''
                    ? settings.bio_after_cut
                    : settings.about_text || '';

                let markCounter = 0;
                const renderMarkedBio = (raw: string) => {
                  const parts = raw.split(
                    /(\[(?:blue|orange|pink|green|yellow|strike):[^\]]+\])/g
                  );
                  return parts.map((part, idx) => {
                    const m = part.match(
                      /^\[(blue|orange|pink|green|yellow|strike):([^\]]+)\]$/
                    );
                    if (!m) return <span key={idx}>{part}</span>;
                    if (m[1] === 'strike') {
                      return (
                        <span
                          key={idx}
                          className="line-through opacity-55"
                        >
                          {m[2]}
                        </span>
                      );
                    }
                    markCounter += 1;
                    const num = markCounter;
                    return (
                      <span key={idx}>
                        <span className={`art-mark art-mark-${m[1]}`}>
                          {m[2]}
                        </span>
                        {bioExpanded && (
                          <sup
                            className="ml-0.5 font-mono text-[10px]"
                            style={{ color: 'var(--art-marker-text)' }}
                          >
                            {num}
                          </sup>
                        )}
                      </span>
                    );
                  });
                };

                const beforeBlocks = rawBefore
                  .split(/\n{2,}/)
                  .map((b) => b.trim())
                  .filter(Boolean);
                const afterBlocks = rawAfter
                  .split(/\n{2,}/)
                  .map((b) => b.trim())
                  .filter(Boolean);

                return (
              <section className="space-y-3.5 text-[14px] leading-[22px] sm:space-y-4 sm:text-[15px] sm:leading-[24px]">
                {beforeBlocks.map((block, bIdx) => {
                  const lines = block.split('\n');
                  const isLastBlock = bIdx === beforeBlocks.length - 1;
                  return (
                    <div key={bIdx}>
                      {lines.map((line, lIdx) => {
                        const isTitleLine = bIdx === 0 && lIdx === 0;
                        const isVeryLastLine =
                          isLastBlock && lIdx === lines.length - 1;
                        if (isTitleLine) {
                          return (
                            <h1
                              key={lIdx}
                              className="font-normal"
                              style={{ color: 'var(--art-ink)' }}
                            >
                              {renderMarkedBio(line)}
                            </h1>
                          );
                        }
                        return (
                          <p
                            key={lIdx}
                            style={{ color: 'var(--art-ink-soft)' }}
                          >
                            {renderMarkedBio(line)}
                            {isVeryLastLine && (
                              <>
                                {' '}
                                Currently:{' '}
                                <span style={{ color: 'var(--art-ink)' }}>
                                  {statusText}
                                </span>
                                .
                              </>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Unfolded Extended Bio — Smooth CSS Grid Accordion */}
                <div
                  className="dev-accordion"
                  data-open={bioExpanded ? 'true' : 'false'}
                  aria-hidden={!bioExpanded}
                >
                  <div className="dev-accordion-inner">
                    <div
                      className="space-y-4 pb-1 pt-2"
                      style={{ color: 'var(--art-ink-soft)' }}
                    >
                      {afterBlocks.length > 0 ? (
                        afterBlocks.map((block, bIdx) => (
                          <p key={bIdx} className="whitespace-pre-wrap">
                            {renderMarkedBio(block)}
                          </p>
                        ))
                      ) : (
                        <p className="whitespace-pre-wrap">
                          I&apos;m an Informatics Engineering student at{' '}
                          <span className="art-mark art-mark-green">
                            Hasanuddin University
                          </span>
                          <sup
                            className="ml-0.5 font-mono text-[10px]"
                            style={{ color: 'var(--art-marker-text)' }}
                          >
                            4
                          </sup>{' '}
                          passionate about{' '}
                          <span className="art-mark art-mark-yellow">
                            full-stack web engineering &amp; intelligent systems
                          </span>
                          , building fast, expressive software that feels alive.
                        </p>
                      )}

                      <ol
                        className="space-y-1.5 border-t pt-3 font-mono text-[11px] leading-[17px]"
                        style={{
                          borderColor: 'var(--art-line)',
                          color: 'var(--art-ink-muted)',
                        }}
                      >
                        {principles.map((pr, idx) => (
                          <li key={idx}>
                            <span style={{ color: 'var(--art-marker-text)' }}>
                              {idx + 1}
                            </span>{' '}
                            {pr}
                          </li>
                        ))}
                      </ol>

                      <div className="flex flex-wrap items-center gap-5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setBioExpanded(false);
                            setCutProgress(0);
                            cutMaxProgressRef.current = 0;
                          }}
                          className="text-[13px] font-medium transition-opacity hover:opacity-75"
                          style={{ color: 'var(--art-marker-text)' }}
                        >
                          Fold it back
                        </button>

                        {settings.resume_url && (
                          <button
                            type="button"
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent('open-pdf-reader', {
                                  detail: {
                                    url: settings.resume_url,
                                    title: 'Resume - Adrian',
                                  },
                                })
                              )
                            }
                            data-cursor-label="read pdf"
                            className="inline-flex items-center gap-1.5 text-[13px] opacity-80 transition-opacity hover:opacity-100"
                            style={{ color: 'var(--art-ink)' }}
                          >
                            <FileText size={13} />
                            <span>Open CV</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
                );
              })()}

              {/* Interactive Drag-Along-the-Line Bio Cut (28 individual falling dashes!) */}
              {!bioExpanded ? (
                <div
                  ref={cutZoneRef}
                  role="button"
                  tabIndex={0}
                  aria-label="Drag all the way along the dashed line to cut the bio open"
                  data-cursor-hide="true"
                  onMouseEnter={() => setIsHoveringCut(true)}
                  onMouseLeave={() => setIsHoveringCut(false)}
                  onMouseDown={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={handleCutPointerDown}
                  onPointerMove={handleCutPointerMove}
                  onPointerUp={handleCutPointerUp}
                  onPointerCancel={releaseCutDrag}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      runAutoSweepCut();
                    }
                  }}
                  className="relative my-2 flex h-[48px] w-full select-none items-center touch-none"
                >
                  {/* 28 Individual Dashes that tumble & fall downward as the scissors pass! */}
                  <div className="pointer-events-none flex w-full items-center gap-[6px]">
                    {Array.from({ length: DASH_COUNT }).map((_, i) => {
                      const dashPos = (i + 0.5) / DASH_COUNT;
                      const isCut = cutProgress >= dashPos;
                      const fallY = 20 + ((i * 7) % 16);
                      const fallRot = i % 2 === 0 ? 18 + (i % 5) * 6 : -(16 + (i % 4) * 7);

                      return (
                        <span
                          key={i}
                          data-cut={isCut ? 'true' : 'false'}
                          className="dev-cut-dash h-[1.5px] flex-1 rounded-full"
                          style={{
                            backgroundColor: 'var(--art-hairline-strong)',
                            ['--fall-y' as string]: `${fallY}px`,
                            ['--fall-rot' as string]: `${fallRot}deg`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Pointer-Following Animated Scissors (resting on the left when idle, follows pointer on hover/drag) */}
                  <div
                    style={{
                      left: `${
                        isDraggingCut || isAutoCutting || cutProgress > 0
                          ? Math.min(98, cutProgress * 100)
                          : isHoveringCut
                          ? cutHoverPct
                          : 3.5
                      }%`,
                      opacity:
                        isHoveringCut || isDraggingCut || isAutoCutting || cutProgress > 0
                          ? 1
                          : 0,
                      transform: `translate(-50%, -50%) scale(${
                        isDraggingCut || isAutoCutting ? 1.15 : 1
                      }) rotate(${
                        isDraggingCut || isAutoCutting
                          ? Math.sin(cutProgress * 36) * 16
                          : 0
                      }deg)`,
                      backgroundColor: 'var(--art-ground)',
                      color: 'var(--art-marker-text)',
                      border: '1px solid var(--art-marker)',
                    }}
                    className="dev-scissors-handle pointer-events-none absolute top-1/2 flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-opacity duration-150"
                  >
                    <Scissors size={13} aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <div
                  className="my-6 h-px w-full"
                  style={{ backgroundColor: 'var(--art-line)' }}
                />
              )}
              </div>

              {/* 5 INTERACTIVE BENTO TILES */}
              <section
                aria-label="Portfolio sections"
                className="grid grid-cols-2 gap-2.5 sm:gap-3"
              >
                <div
                  data-agent-slot="top-tiles"
                  className="col-span-2 grid grid-cols-2 gap-2.5 sm:gap-3"
                >
                {/* TILE 1 (Left): Selected Projects [W] — Auto-Flipping & Draggable Card Deck */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (deckJustDraggedRef.current) return;
                    navigateTo('work');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigateTo('work');
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      flipDeckCard(1, -1);
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      flipDeckCard(-1, 1);
                    }
                  }}
                  onMouseEnter={() => setHoveredTile('work')}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="group relative col-span-2 min-h-[244px] w-full overflow-hidden rounded-[16px] p-4 text-left backdrop-blur-md transition-colors duration-200 cursor-pointer sm:col-span-1 sm:min-h-0 sm:aspect-square"
                  style={{
                    viewTransitionName:
                      morphKey === 'work' ? 'active-tile-morph' : undefined,
                    backgroundColor: 'var(--art-tile)',
                    border:
                      hoveredTile === 'work'
                        ? '1px solid var(--art-hairline-strong)'
                        : '1px solid var(--art-line)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[13px] leading-[20px]"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      Selected projects
                    </span>

                    {deckProjects.length > 1 && (
                      <div
                        className="relative z-30 flex items-center gap-1 font-mono text-[10px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label="Previous project card"
                          onClick={(e) => {
                            e.stopPropagation();
                            flipDeckCard(-1, 1);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-[5px] opacity-100 sm:opacity-0 transition-all duration-200 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:text-[var(--art-marker-text)] cursor-pointer"
                          style={{
                            backgroundColor: 'var(--art-card-solid)',
                            border: '1px solid var(--art-line)',
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          aria-label="Next project card"
                          onClick={(e) => {
                            e.stopPropagation();
                            flipDeckCard(1, -1);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-[5px] opacity-100 sm:opacity-0 transition-all duration-200 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:text-[var(--art-marker-text)] cursor-pointer"
                          style={{
                            backgroundColor: 'var(--art-card-solid)',
                            border: '1px solid var(--art-line)',
                          }}
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interactive Stacked Card Deck — Auto-cycles like turning sheets + 120fps Direct-DOM Drag */}
                  <div
                    onPointerDown={handleDeckPointerDown}
                    onPointerMove={handleDeckPointerMove}
                    onPointerUp={handleDeckPointerUp}
                    onPointerCancel={handleDeckPointerUp}
                    onDragStart={(e) => e.preventDefault()}
                    className="relative mt-5 h-[182px] w-full select-none touch-pan-y cursor-grab active:cursor-grabbing"
                  >
                    {deckProjects.map((proj, idx) => {
                      const total = deckProjects.length;
                      const offset =
                        (idx - safeActiveProjectIdx + total) % total;
                      const isExiting = deckExiting?.id === proj.id;
                      const isSettling = deckSettlingId === proj.id;
                      const spread = hoveredTile === 'work' ? 1 : 0;

                      let transform =
                        'translate3d(18px, -14px, 0) rotate(4deg) scale(0.9)';
                      let opacity = 0;
                      let zIndex = 5;
                      let transition = 'none';
                      let pointerEvents: 'auto' | 'none' = 'none';

                      if (isExiting && deckExiting) {
                        transform = `translate3d(${deckExiting.dir * 124}%, 14px, 0) rotate(${deckExiting.dir * 13}deg) scale(0.92)`;
                        opacity = 0;
                        zIndex = 30;
                        transition =
                          'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease';
                      } else if (offset === 0) {
                        transform = spread
                          ? 'translate3d(0px, -3px, 0) rotate(0deg) scale(1.015)'
                          : 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)';
                        opacity = 1;
                        zIndex = 20;
                        transition =
                          'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease';
                        pointerEvents = 'auto';
                      } else if (offset === 1) {
                        const tx = 7 + spread * 4;
                        const ty = -6 - spread * 3;
                        const rot = 1.6 + spread * 0.9;
                        transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(0.97)`;
                        opacity = 0.78;
                        zIndex = 15;
                        transition =
                          'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 340ms ease';
                      } else if (offset === 2) {
                        const tx = 14 + spread * 7;
                        const ty = -12 - spread * 5;
                        const rot = 3.1 + spread * 1.4;
                        transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg) scale(0.94)`;
                        opacity = 0.52;
                        zIndex = 10;
                        transition =
                          'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 340ms ease';
                      }

                      if (isSettling) {
                        opacity = 0;
                        transition = 'none';
                      }

                      return (
                        <div
                          key={proj.id}
                          ref={(node) => {
                            deckCardRefs.current[proj.id] = node;
                          }}
                          aria-hidden={offset !== 0}
                          className="absolute inset-x-2 top-3 flex h-[152px] flex-col overflow-hidden rounded-[9px] shadow-[0_6px_18px_rgba(0,0,0,0.22)] will-change-transform"
                          style={{
                            backgroundColor: 'var(--art-card-solid)',
                            border: '1px solid var(--art-line)',
                            transform,
                            opacity,
                            zIndex,
                            transition,
                            pointerEvents,
                          }}
                        >
                          <div className="relative h-[96px] w-full shrink-0 overflow-hidden bg-black/25">
                            {proj.image &&
                            !brokenImages[proj.image] &&
                            (offset <= 2 || isExiting || isSettling) ? (
                              <Image
                                src={proj.image}
                                alt={proj.title}
                                fill
                                draggable={false}
                                sizes="240px"
                                fetchPriority={offset === 0 ? 'high' : 'low'}
                                loading={offset === 0 ? 'eager' : 'lazy'}
                                onError={() => markImageBroken(proj.image)}
                                className={`object-cover transition-transform duration-500 ${
                                  offset === 0
                                    ? 'group-hover:scale-[1.05]'
                                    : ''
                                }`}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#a3a3a3]">
                                {proj.category}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-center px-3 py-2">
                            <p
                              className="truncate text-[12.5px] font-medium leading-tight"
                              style={{ color: 'var(--art-ink)' }}
                            >
                              {proj.title}
                            </p>
                            <div className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[9.5px]">
                              <span
                                className="truncate"
                                style={{ color: 'var(--art-ink-muted)' }}
                              >
                                {proj.category}
                              </span>
                              <span
                                className="shrink-0"
                                style={{ color: 'var(--art-marker-text)' }}
                              >
                                {proj.year}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ScrambleKeychip
                    label="SELECTED PROJECTS"
                    shortcut="S"
                    active={hoveredTile === 'work'}
                  />

                  <span
                    className="absolute bottom-3.5 right-4 z-10 font-mono text-[11px]"
                    style={{
                      color:
                        hoveredTile === 'work'
                          ? 'var(--art-ink)'
                          : 'var(--art-ink-muted)',
                    }}
                  >
                    S
                  </span>
                </div>

                {/* TILE 2 (Right): Portal to Creative Side (dri4n.com/art) [A] — 2.4s Cross-Fade Photo Preview */}
                <button
                  type="button"
                  onClick={(e) => navigateWithCirclePortal(ART_PATH, router, e)}
                  onMouseEnter={() => setHoveredTile('art')}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="group relative col-span-2 block h-[196px] w-full overflow-hidden rounded-[16px] text-left transition-all duration-300 sm:col-span-1 sm:h-auto sm:aspect-square"
                  style={{
                    backgroundColor: 'var(--art-tile)',
                    border:
                      hoveredTile === 'art'
                        ? '1px solid var(--art-hairline-strong)'
                        : '1px solid var(--art-line)',
                  }}
                >
                  <div className="absolute inset-0">
                    {artSlides.map((slide, idx) => {
                      const isActive = idx === artSlideIdx % artSlides.length;
                      return (
                        <div
                          key={slide.id}
                          className="absolute inset-0 will-change-[opacity,transform]"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transform: isActive
                              ? hoveredTile === 'art'
                                ? 'scale(1.04)'
                                : 'scale(1)'
                              : 'scale(1.05)',
                            transition:
                              'opacity 380ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        >
                          {!brokenImages[slide.image] ? (
                            <Image
                              src={slide.image}
                              alt={slide.label}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 100vw, 280px"
                              loading={isActive ? 'eager' : 'lazy'}
                              fetchPriority={isActive ? undefined : 'low'}
                              onError={() => markImageBroken(slide.image)}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#231f1e] via-[#171717] to-[#2e1e1a] font-mono text-[11px] uppercase tracking-[0.16em] text-[#aaa297]">
                              Creative Side
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  </div>

                  {/* Top bar: Creative Side label (consistent top-left) + portal icon */}
                  <div className="absolute inset-x-3.5 top-3.5 z-10 flex items-center justify-between gap-2">
                    <span className="truncate rounded-[6px] bg-black/55 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur-md">
                      Creative Side
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  </div>

                  <ScrambleKeychip
                    label="CREATIVE SIDE"
                    shortcut="C"
                    active={hoveredTile === 'art'}
                  />

                  <span className="absolute bottom-3.5 right-4 z-10 font-mono text-[11px] text-white/85 group-hover:text-white">
                    C
                  </span>
                </button>
                </div>

                {/* TILE 3 (Full-Width Horizontal): Writing / Blog [B] */}
                <button
                  type="button"
                  data-agent-slot="writing"
                  onClick={() => navigateTo('writing')}
                  onMouseEnter={() => setHoveredTile('writing')}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="group relative col-span-2 flex min-h-[124px] w-full flex-row items-center justify-between gap-3.5 overflow-hidden rounded-[16px] p-3.5 text-left backdrop-blur-md transition-colors duration-200 sm:min-h-[188px] sm:gap-4 sm:p-5"
                  style={{
                    viewTransitionName:
                      morphKey === 'writing' ? 'active-tile-morph' : undefined,
                    backgroundColor: 'var(--art-tile)',
                    border:
                      hoveredTile === 'writing'
                        ? '1px solid var(--art-hairline-strong)'
                        : '1px solid var(--art-line)',
                  }}
                >
                  <div
                    className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[10px] sm:h-[144px] sm:w-[144px]"
                    style={{
                      border: '1px solid var(--art-line)',
                      backgroundColor: 'var(--art-paper-raised)',
                    }}
                  >
                    {!brokenImages[latestArticle.img] ? (
                      <Image
                        src={latestArticle.img}
                        alt={latestArticle.title}
                        fill
                        sizes="(max-width: 640px) 92px, 144px"
                        loading="lazy"
                        onError={() => markImageBroken(latestArticle.img)}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-3 text-center font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--art-ink-muted)' }}>
                        <span style={{ color: 'var(--art-marker-text)' }}>BLOG</span>
                        <span>{latestArticle.category}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between space-y-2 pr-4">
                    <span
                      className="text-[13px]"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      Writing
                    </span>
                    <h2
                      className="text-[16px] font-medium leading-[22px]"
                      style={{ color: 'var(--art-ink)' }}
                    >
                      {latestArticle.title}
                    </h2>
                    <p
                      className="line-clamp-2 text-[13px] leading-[19px]"
                      style={{ color: 'var(--art-ink-soft)' }}
                    >
                      {latestArticle.excerpt}
                    </p>
                    <span
                      className="pt-1 font-mono text-[11px]"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      {latestArticle.date} · {latestArticle.category}
                    </span>
                  </div>

                  <ScrambleKeychip
                    label="WRITING"
                    shortcut="W"
                    active={hoveredTile === 'writing'}
                  />

                  <span
                    className="absolute bottom-3.5 right-4 z-10 font-mono text-[11px]"
                    style={{
                      color:
                        hoveredTile === 'writing'
                          ? 'var(--art-ink)'
                          : 'var(--art-ink-muted)',
                    }}
                  >
                    W
                  </span>
                </button>

                <div
                  data-agent-slot="bottom-tiles"
                  className="col-span-2 grid grid-cols-2 gap-2.5 sm:gap-3"
                >
                {/* TILE 4: Track Record [E] (Ultra-minimal like Shahriyar bottom-left tile) */}
                <button
                  type="button"
                  onClick={() => navigateTo('experience')}
                  onMouseEnter={() => setHoveredTile('experience')}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="group relative col-span-1 flex min-h-[164px] w-full flex-col justify-between overflow-hidden rounded-[16px] p-3.5 text-left backdrop-blur-md transition-colors duration-200 sm:min-h-0 sm:aspect-square sm:p-5"
                  style={{
                    viewTransitionName:
                      morphKey === 'experience' ? 'active-tile-morph' : undefined,
                    backgroundColor: 'var(--art-tile)',
                    border:
                      hoveredTile === 'experience'
                        ? '1px solid var(--art-hairline-strong)'
                        : '1px solid var(--art-line)',
                  }}
                >
                  <span
                    className="text-[12.5px] sm:text-[13px]"
                    style={{ color: 'var(--art-ink-muted)' }}
                  >
                    Track record
                  </span>

                  <div className="space-y-1.5 pb-1 pr-4 sm:space-y-2 sm:pb-2 sm:pr-6">
                    {experiences.slice(0, 3).map((item, idx) => {
                      const isActive = idx === activeServiceIdx;
                      return (
                        <p
                          key={item.id}
                          onMouseEnter={() => setActiveServiceIdx(idx)}
                          className="truncate text-[12px] leading-[18px] transition-[opacity,transform] duration-200 sm:text-[13.5px] sm:leading-[20px]"
                          style={{
                            color: 'var(--art-ink)',
                            opacity: isActive ? 1 : 0.42,
                            transform: isActive
                              ? 'translateX(3px)'
                              : 'translateX(0px)',
                          }}
                        >
                          {item.company}
                        </p>
                      );
                    })}
                  </div>

                  <ScrambleKeychip
                    label="TRACK RECORD"
                    shortcut="T"
                    active={hoveredTile === 'experience'}
                  />

                  <span
                    className="absolute bottom-3 right-3.5 z-10 font-mono text-[10.5px] sm:bottom-3.5 sm:right-4 sm:text-[11px]"
                    style={{
                      color:
                        hoveredTile === 'experience'
                          ? 'var(--art-ink)'
                          : 'var(--art-ink-muted)',
                    }}
                  >
                    T
                  </span>
                </button>

                {/* TILE 5: Activity [R] (Full-bleed 5s auto-rotating GIF collection from Admin) */}
                <button
                  type="button"
                  onClick={() => navigateTo('resources')}
                  onMouseEnter={() => setHoveredTile('resources')}
                  onMouseLeave={() => setHoveredTile(null)}
                  className="group relative col-span-1 flex min-h-[164px] w-full flex-col justify-between overflow-hidden rounded-[16px] p-3 text-left backdrop-blur-md transition-colors duration-200 cursor-pointer sm:min-h-0 sm:aspect-square sm:p-4"
                  style={{
                    viewTransitionName:
                      morphKey === 'resources' ? 'active-tile-morph' : undefined,
                    backgroundColor: 'var(--art-tile)',
                    border:
                      hoveredTile === 'resources'
                        ? '1px solid var(--art-hairline-strong)'
                        : '1px solid var(--art-line)',
                  }}
                >
                  {activityGifs.length > 0 ? (
                    <>
                      {/* Full-bleed cross-fading GIF collection (5s interval, mounts only current + next for low memory) */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {activityGifs.map((gifUrl, idx) => {
                          const currentIdx =
                            activityGifIdx % activityGifs.length;
                          const nextIdx =
                            (currentIdx + 1) % activityGifs.length;
                          const isCurrent = idx === currentIdx;
                          const isNext = idx === nextIdx;
                          if (!isCurrent && !isNext) return null;
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={`${gifUrl}-${idx}`}
                              src={gifUrl}
                              alt={`Activity GIF ${idx + 1}`}
                              loading={isCurrent ? 'eager' : 'lazy'}
                              fetchPriority={isCurrent ? undefined : 'low'}
                              decoding="async"
                              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                                isCurrent ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                          );
                        })}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35" />
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="truncate rounded-[6px] bg-black/55 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur-md">
                          Activity
                        </span>
                      </div>

                      <ScrambleKeychip
                        label="ACTIVITY"
                        shortcut="A"
                        active={hoveredTile === 'resources'}
                      />

                      <span className="absolute bottom-3.5 right-4 z-10 font-mono text-[11px] text-white/85 group-hover:text-white">
                        A
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="relative z-10 px-1 text-[12.5px] sm:text-[13px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        Activity
                      </span>

                      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            theme === 'dark'
                              ? '/images/activity-frame-1-dark.png'
                              : '/images/activity-frame-1.png'
                          }
                          alt="Activity desk illustration"
                          width={220}
                          height={220}
                          className="h-[118px] w-[118px] object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:h-[172px] sm:w-[172px]"
                        />
                      </div>

                      <ScrambleKeychip
                        label="ACTIVITY"
                        shortcut="A"
                        active={hoveredTile === 'resources'}
                      />

                      <span
                        className="absolute bottom-3.5 right-4 z-10 font-mono text-[11px]"
                        style={{
                          color:
                            hoveredTile === 'resources'
                              ? 'var(--art-ink)'
                              : 'var(--art-ink-muted)',
                        }}
                      >
                        A
                      </span>
                    </>
                  )}
                </button>
                </div>
              </section>

              {/* Minimal Homepage Footer */}
              <footer className="mt-7">
                <nav
                  aria-label="Contact"
                  className="flex min-h-[44px] flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-[20px]"
                >
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    data-cursor-label={copiedEmail ? 'copied' : 'copy'}
                    className="transition-colors hover:opacity-100"
                    style={{
                      color: copiedEmail
                        ? 'var(--art-marker-text)'
                        : 'var(--art-ink-muted)',
                    }}
                  >
                    {copiedEmail ? 'Copied!' : emailAddress}
                  </button>

                  {settings.resume_url && (
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent('open-pdf-reader', {
                            detail: {
                              url: settings.resume_url,
                              title: 'Resume - Adrian',
                            },
                          })
                        )
                      }
                      data-cursor-label="read pdf"
                      className="opacity-75 transition-colors hover:opacity-100"
                      style={{ color: 'var(--art-ink)' }}
                    >
                      Open CV
                    </button>
                  )}

                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="visit"
                    className="opacity-75 transition-colors hover:opacity-100"
                    style={{ color: 'var(--art-ink)' }}
                  >
                    GitHub
                  </a>

                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="visit"
                    className="opacity-75 transition-colors hover:opacity-100"
                    style={{ color: 'var(--art-ink)' }}
                  >
                    LinkedIn
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="visit"
                    className="opacity-75 transition-colors hover:opacity-100"
                    style={{ color: 'var(--art-ink)' }}
                  >
                    Instagram
                  </a>
                </nav>
                <SpotifyFooterCredit />
              </footer>
            </main>
          )}

          {/* =================================================================
              SUB-VIEW 1: SELECTED WORK (#work — Live Dev Projects)
          ================================================================== */}
          {activeView === 'work' && (
            <div key="dev-work">
              <SubViewTopBar sectionLabel="SELECTED PROJECTS" />

              <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8 md:flex-row md:gap-12 lg:gap-16">
                <aside className="flex items-center gap-4 md:sticky md:top-20 md:block md:w-[248px] md:space-y-5 md:self-start">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    data-cursor-label="home"
                    className="relative block h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[12px] transition-transform hover:scale-[1.03] md:h-[120px] md:w-[120px]"
                    style={{
                      viewTransitionName:
                        morphKey === 'work' ? 'active-tile-morph' : undefined,
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    <Image
                      src={currentProjectPreview.image}
                      alt="Back to index"
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                  <div className="min-w-0 space-y-1 md:space-y-2">
                    <h1 className="text-[18px] font-semibold tracking-[-0.01em] md:text-[20px]">
                      Selected projects
                    </h1>
                    <p
                      className="text-[13px] leading-[19px] md:text-[14px] md:leading-[21px]"
                      style={{ color: 'var(--art-ink-soft)' }}
                    >
                      {projects.length} software &amp; full-stack engineering
                      projects synced from the database.
                    </p>
                  </div>
                </aside>

                <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                  {projects.map((item, idx) => (
                    <article
                      key={item.id}
                      className="dev-enter-card group flex flex-col justify-between space-y-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
                      style={{ ['--enter-delay' as string]: `${idx * 65}ms` }}
                    >
                      <div>
                        <Link
                          href={item.slug ? `/projects/${item.slug}` : '/dev'}
                          onMouseEnter={() => {
                            if (item.slug) router.prefetch(`/projects/${item.slug}`);
                          }}
                          onClick={(e) => {
                            saveScrollForView('work');
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            navigateWithCirclePortal(
                              item.slug ? `/projects/${item.slug}` : '/dev',
                              router,
                              e
                            );
                          }}
                          data-cursor-label="open"
                          className="dev-scaffold-card relative block aspect-[16/10] w-full overflow-hidden rounded-[12px]"
                          style={{
                            backgroundColor: 'var(--art-tile)',
                            border: '1px solid var(--art-line)',
                            ['--scaffold-delay' as string]: `${idx * 90}ms`,
                          }}
                        >
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                          />
                        </Link>

                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={
                                item.slug ? `/projects/${item.slug}` : '/dev'
                              }
                              onClick={(e) => {
                                saveScrollForView('work');
                                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                                e.preventDefault();
                                navigateWithCirclePortal(
                                  item.slug ? `/projects/${item.slug}` : '/dev',
                                  router,
                                  e
                                );
                              }}
                              className="dev-hover-title text-[15px] font-medium leading-snug"
                            >
                              {item.title}
                            </Link>
                            <p
                              className="text-[13px]"
                              style={{ color: 'var(--art-ink-muted)' }}
                            >
                              {item.category}
                            </p>
                          </div>
                          <span
                            className="font-mono text-[11px]"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            {item.year}
                          </span>
                        </div>

                        {item.description && (
                          <p
                            className="mt-1.5 line-clamp-2 text-[13px] leading-[19px]"
                            style={{ color: 'var(--art-ink-soft)' }}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px]">
                        {item.slug && (
                          <Link
                            href={`/projects/${item.slug}`}
                            data-cursor-label="read"
                            className="inline-flex items-center gap-1"
                            style={{ color: 'var(--art-marker-text)' }}
                          >
                            <span>Case Study</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        )}
                        {item.github && (
                          <a
                            href={item.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor-label="visit"
                            className="inline-flex items-center gap-1"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            <GitBranch size={12} />
                            <span>GitHub</span>
                          </a>
                        )}
                        {item.demo && (
                          <a
                            href={item.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor-label="visit"
                            className="inline-flex items-center gap-1"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            <ExternalLink size={12} />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-VIEW 2: TRACK RECORD (#experience — Work Experience + Competition Awards + Tearable Ticket)
          ================================================================== */}
          {activeView === 'experience' && (
            <div key="dev-experience">
              <SubViewTopBar sectionLabel="TRACK RECORD" />

              <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8 md:flex-row md:gap-12 lg:gap-16">
                {/* Sticky 248px Sidebar (matching Shahriyar's Work with me sidebar) */}
                <aside className="flex items-center gap-4 md:sticky md:top-20 md:block md:w-[248px] md:space-y-5 md:self-start">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    data-cursor-label="home"
                    className="flex h-[76px] w-[76px] shrink-0 flex-col justify-between rounded-[12px] p-2.5 text-left transition-transform hover:scale-[1.03] md:h-[120px] md:w-[120px] md:p-3"
                    style={{
                      viewTransitionName:
                        morphKey === 'experience'
                          ? 'active-tile-morph'
                          : undefined,
                      backgroundColor: 'var(--art-tile)',
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    <span
                      className="text-[9px] md:text-[10px]"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      Track record
                    </span>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="truncate text-[9.5px] font-medium md:text-[10px]">
                        {experiences[0]?.role}
                      </p>
                      <p
                        className="truncate font-mono text-[8px] md:text-[9px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {experiences.length} roles · {achievements.length} awards
                      </p>
                    </div>
                  </button>

                  <div className="min-w-0 space-y-1 md:space-y-2">
                    <h1 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] md:text-[18px]">
                      <span
                        className="font-mono text-[11px] font-normal md:text-[12px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        [E]
                      </span>
                      <span>Track record</span>
                    </h1>
                    <p
                      className="text-[13px] leading-[19px] md:text-[14px] md:leading-[21px]"
                      style={{ color: 'var(--art-ink-soft)' }}
                    >
                      Work experience, technical roles, and national competition
                      awards. Tear the ticket below to collaborate.
                    </p>
                  </div>
                </aside>

                {/* Main Column: Vijay Gupta Horizontal Career Timeline + Expandable Role Details + Awards */}
                <div className="min-w-0 flex-1 space-y-12">
                  {/* 1. EXPERIENCE EDITORIAL HEADER + PINCH-TO-ZOOM HORIZONTAL GANTT TIMELINE */}
                  {(() => {
                    const timelineMin = 2024.8;
                    const timelineMax = 2027.0;
                    const totalSpan = timelineMax - timelineMin;

                    const ticks =
                      timelineZoom >= 1.45
                        ? [
                            { label: '2025', pos: 2025.0 },
                            { label: 'Feb', pos: 2025 + 1 / 12 },
                            { label: 'Apr', pos: 2025 + 3 / 12 },
                            { label: 'Jun', pos: 2025 + 5 / 12 },
                            { label: 'Aug', pos: 2025 + 7 / 12 },
                            { label: 'Oct', pos: 2025 + 9 / 12 },
                            { label: '2026', pos: 2026.0 },
                            { label: 'Feb', pos: 2026 + 1 / 12 },
                            { label: 'Apr', pos: 2026 + 3 / 12 },
                            { label: 'Jun', pos: 2026 + 5 / 12 },
                            { label: 'Aug', pos: 2026 + 7 / 12 },
                            { label: 'NOW', pos: 2026.85 },
                          ]
                        : [
                            { label: '2025', pos: 2025.0 },
                            { label: 'Q2', pos: 2025.25 },
                            { label: 'Q3', pos: 2025.5 },
                            { label: 'Q4', pos: 2025.75 },
                            { label: '2026', pos: 2026.0 },
                            { label: 'Q2', pos: 2026.25 },
                            { label: 'Q3', pos: 2026.5 },
                            { label: 'NOW', pos: 2026.85 },
                          ];

                    const activeRoleId = expandedExpId ?? experiences[0]?.id ?? null;
                    const timelineRows = experiences.toReversed();
                    const isZoomed = Math.abs(timelineZoom - 1) > 0.03;

                    return (
                      <div className="dev-scaffold-card min-w-0 max-w-full rounded-[12px] p-1 space-y-6">
                        {/* Editorial Header Row */}
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                          <div className="flex flex-wrap items-baseline gap-3">
                            <h2 className="text-[30px] sm:text-[38px] font-bold uppercase tracking-[-0.03em] leading-none">
                              EXPERIENCE
                            </h2>
                            <span
                              className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                              style={{
                                color: isZoomed
                                  ? 'var(--art-marker-text)'
                                  : 'var(--art-ink-muted)',
                              }}
                            >
                              {isZoomed
                                ? `${Math.round(timelineZoom * 100)}% · dbl-click reset`
                                : 'Pinch to zoom'}
                            </span>
                          </div>

                          <p
                            className="max-w-[300px] text-[13px] leading-[19px]"
                            style={{ color: 'var(--art-ink-soft)' }}
                          >
                            Building digital systems, web platforms &amp; media
                            experiences.{' '}
                            <a
                              href={linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor-label="visit"
                              className="inline-flex items-center gap-0.5 underline underline-offset-4"
                              style={{ color: 'var(--art-ink)' }}
                            >
                              Full history on LinkedIn
                              <ArrowUpRight size={12} />
                            </a>
                          </p>
                        </div>

                        {/* Top Solid Divider */}
                        <div
                          className="h-[1.5px] w-full"
                          style={{ backgroundColor: 'var(--art-ink)' }}
                        />

                        {/* Fixed-Width Scrollable Horizontal Gantt Career Timeline (Pinch-to-Zoom inside box) */}
                        <div
                          ref={timelineScrollRef}
                          onDoubleClick={() => setTimelineZoom(1)}
                          className="w-full max-w-full overflow-x-auto overscroll-x-contain pb-2 custom-scrollbar touch-pan-x"
                        >
                          <div
                            className={`relative pt-7 pb-3 will-change-[width] ${
                              isPinchingTimeline
                                ? ''
                                : 'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
                            }`}
                            style={{
                              width: `${(timelineZoom * 100).toFixed(2)}%`,
                              minWidth: `${Math.round(480 * timelineZoom)}px`,
                            }}
                          >
                            {/* Vertical Year/Quarter Gridlines + Top Labels */}
                            <div className="pointer-events-none absolute inset-0">
                              {ticks.map((tick) => {
                                const leftPct =
                                  ((tick.pos - timelineMin) / totalSpan) * 100;
                                return (
                                  <div
                                    key={tick.label + tick.pos}
                                    style={{ left: `${leftPct}%` }}
                                    className="absolute top-0 bottom-0"
                                  >
                                    <span
                                      className="block -translate-x-1/2 font-mono text-[10px]"
                                      style={{ color: 'var(--art-ink-muted)' }}
                                    >
                                      {tick.label}
                                    </span>
                                    <div
                                      className="mt-2 h-[calc(100%-22px)] w-px"
                                      style={{
                                        backgroundColor: 'var(--art-hairline)',
                                      }}
                                    />
                                  </div>
                                );
                              })}
                              {/* Horizontal Axis Baseline under labels */}
                              <div
                                className="absolute left-0 right-0 top-[22px] h-px"
                                style={{
                                  backgroundColor: 'var(--art-hairline-strong)',
                                }}
                              />
                            </div>

                            {/* Clickable Horizontal Role Bars */}
                            <div className="relative z-10 space-y-2.5 pt-2">
                              {timelineRows.map((exp, barIdx) => {
                                const range = parsePeriodRange(exp.year);
                                const clampedStart = Math.max(
                                  timelineMin,
                                  Math.min(timelineMax - 0.15, range.start)
                                );
                                const clampedEnd = Math.min(
                                  timelineMax,
                                  Math.max(clampedStart + 0.2, range.end)
                                );
                                const leftPct =
                                  ((clampedStart - timelineMin) / totalSpan) *
                                  100;
                                const widthPct = Math.max(
                                  14,
                                  ((clampedEnd - clampedStart) / totalSpan) * 100
                                );
                                const isSelected = exp.id === activeRoleId;
                                const isHighlight = isSelected || range.isCurrent;

                                return (
                                  <div
                                    key={`bar-${exp.id}`}
                                    className="relative h-[28px] w-full"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setExpandedExpId(exp.id)}
                                      data-cursor-label="inspect"
                                      style={{
                                        left: `${leftPct}%`,
                                        width: `${Math.min(
                                          100 - leftPct,
                                          widthPct
                                        )}%`,
                                        backgroundColor: isSelected
                                          ? 'var(--art-marker)'
                                          : range.isCurrent
                                          ? 'var(--art-ink)'
                                          : 'var(--art-tile)',
                                        color: isSelected
                                          ? 'var(--art-on-marker)'
                                          : range.isCurrent
                                          ? 'var(--art-ground)'
                                          : 'var(--art-ink)',
                                        border: isHighlight
                                          ? '1px solid transparent'
                                          : '1px solid var(--art-line)',
                                        ['--bar-delay' as string]: `${barIdx * 95}ms`,
                                      }}
                                      className="dev-timeline-bar absolute top-0 flex h-[26px] cursor-pointer items-center justify-between gap-1.5 rounded-[6px] px-2 text-left text-[11px] font-medium transition-[opacity,box-shadow] duration-200 hover:opacity-95 hover:shadow-md"
                                    >
                                      <span className="flex min-w-0 items-center gap-1.5">
                                        {exp.logoUrl && (
                                          <img
                                            src={exp.logoUrl}
                                            alt={exp.company}
                                            className="h-4 w-4 shrink-0 rounded-[3px] object-contain"
                                          />
                                        )}
                                        <span className="truncate">
                                          {exp.company}
                                        </span>
                                      </span>
                                      {range.isCurrent && (
                                        <span
                                          className="dev-live-pulse ml-1.5 h-2 w-2 shrink-0 rounded-full border"
                                          style={{
                                            borderColor: isSelected
                                              ? 'var(--art-on-marker)'
                                              : 'var(--art-marker)',
                                            backgroundColor: isSelected
                                              ? 'transparent'
                                              : 'var(--art-marker)',
                                          }}
                                        />
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Solid Divider */}
                        <div
                          className="h-[1.5px] w-full"
                          style={{ backgroundColor: 'var(--art-ink)' }}
                        />

                        {/* Expandable Role Accordion Rows (Vijay Gupta Style) */}
                        <div
                          className="divide-y"
                          style={{ borderColor: 'var(--art-line)' }}
                        >
                          {experiences.map((exp) => {
                            const isOpen = exp.id === activeRoleId;
                            const isCurrent =
                              exp.year.toUpperCase().includes('NOW') ||
                              exp.year.toUpperCase().includes('PRESENT');

                            return (
                              <div
                                key={`row-${exp.id}`}
                                className="py-6"
                                style={{ borderColor: 'var(--art-line)' }}
                              >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-[150px_1fr_auto] md:items-start">
                                  {/* Left: Period Pill */}
                                  <div>
                                    <span
                                      className="inline-block rounded-full px-3 py-1 font-mono text-[11px] font-medium"
                                      style={{
                                        backgroundColor: isCurrent
                                          ? 'var(--art-marker)'
                                          : 'var(--art-tile)',
                                        color: isCurrent
                                          ? 'var(--art-on-marker)'
                                          : 'var(--art-ink-soft)',
                                        border: isCurrent
                                          ? '1px solid transparent'
                                          : '1px solid var(--art-line)',
                                      }}
                                    >
                                      {exp.year}
                                    </span>
                                  </div>

                                  {/* Center: Company Logo + Name + Role + Expandable Square-Bullet Details */}
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedExpId(isOpen ? '' : exp.id)
                                      }
                                      className="group flex items-start gap-3.5 text-left"
                                    >
                                      {/* Company Logo Badge (blends cleanly with theme, no harsh white box) */}
                                      <div
                                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[9px]"
                                        style={{
                                          backgroundColor: 'var(--art-tile)',
                                          border: '1px solid var(--art-line)',
                                        }}
                                      >
                                        {exp.logoUrl ? (
                                          <img
                                            src={exp.logoUrl}
                                            alt={exp.company}
                                            className="h-full w-full object-contain p-1.5"
                                          />
                                        ) : (
                                          <span
                                            className="font-mono text-[12px] font-semibold uppercase"
                                            style={{ color: 'var(--art-ink-muted)' }}
                                          >
                                            {(exp.company || 'D').slice(0, 2)}
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <h3 className="dev-hover-title text-[20px] font-semibold tracking-[-0.02em] leading-snug">
                                          {exp.company}
                                        </h3>
                                        <p
                                          className="mt-0.5 text-[13px]"
                                          style={{ color: 'var(--art-ink-soft)' }}
                                        >
                                          {exp.role} · {exp.location}
                                        </p>
                                      </div>
                                    </button>

                                    {/* Smooth CSS Grid Accordion for Experience Details */}
                                    <div
                                      className="dev-accordion"
                                      data-open={isOpen ? 'true' : 'false'}
                                      aria-hidden={!isOpen}
                                    >
                                      <div className="dev-accordion-inner">
                                        <div className="space-y-3 pt-4">
                                          <p
                                            className="text-[14px] leading-[22px]"
                                            style={{
                                              color: 'var(--art-ink-soft)',
                                            }}
                                          >
                                            {exp.desc}
                                          </p>
                                          {exp.points &&
                                            exp.points.length > 0 && (
                                              <ul className="space-y-2">
                                                {exp.points.map((pt, pIdx) => (
                                                  <li
                                                    key={pIdx}
                                                    className="flex items-start gap-2.5 text-[13.5px] leading-[20px]"
                                                    style={{
                                                      color:
                                                        'var(--art-ink-soft)',
                                                    }}
                                                  >
                                                    <span
                                                      className="mt-[7px] inline-block h-[5px] w-[5px] shrink-0"
                                                      style={{
                                                        backgroundColor:
                                                          'var(--art-ink)',
                                                      }}
                                                    />
                                                    <span>{pt}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Circular +/- Toggle Button */}
                                  <div className="flex items-center justify-end">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedExpId(isOpen ? '' : exp.id)
                                      }
                                      aria-label={
                                        isOpen ? 'Collapse role' : 'Expand role'
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                                      style={{
                                        backgroundColor: isOpen
                                          ? 'var(--art-ink)'
                                          : 'var(--art-tile)',
                                        color: isOpen
                                          ? 'var(--art-ground)'
                                          : 'var(--art-ink)',
                                        border: '1px solid var(--art-line)',
                                      }}
                                    >
                                      {isOpen ? (
                                        <Minus size={14} />
                                      ) : (
                                        <Plus size={14} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 1.5. COMMUNITY & CREW PASSES — Monochrome Editorial Lanyard Desk (Single Vermilion Accent) */}
                  {activities.length > 0 && (() => {
                    const TILT_PRESETS = [-1.8, 1.4, -1.2, 1.6, -1.5, 1.1, -1.6, 1.3];

                    const selectedIndex = Math.max(
                      0,
                      activities.findIndex((a) => a.id === activePassId)
                    );
                    const activePass =
                      activities.find((a) => a.id === activePassId) ||
                      activities[0];
                    const isActivePassNow = activePass.timeline
                      .toUpperCase()
                      .includes('NOW');

                    return (
                      <div className="space-y-4">
                        {/* Section Header + Minimal Shuffle Control */}
                        <div className="flex items-center justify-between gap-3">
                          <p
                            className="font-mono text-[11px] uppercase tracking-[0.14em]"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            Organizations &amp; Volunteering ({activities.length})
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              setPassShuffleSeed((s) => s + 1);
                              const nextIdx =
                                (selectedIndex + 1) % activities.length;
                              setActivePassId(activities[nextIdx].id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors duration-200 active:scale-95"
                            style={{
                              backgroundColor: 'var(--art-tile)',
                              color: 'var(--art-ink-soft)',
                              border: '1px solid var(--art-line)',
                            }}
                          >
                            <span>Shuffle</span>
                            <kbd
                              className="rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] leading-none"
                              style={{
                                backgroundColor: 'var(--art-ground)',
                                color: 'var(--art-ink)',
                                border: '1px solid var(--art-line)',
                              }}
                            >
                              ↵
                            </kbd>
                          </button>
                        </div>

                        {/* Uniform Theme-Matched Tactile Lanyard Passes */}
                        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
                          {activities.map((act, idx) => {
                            const isSelected = activePass.id === act.id;
                            const baseTilt =
                              TILT_PRESETS[
                                (idx + passShuffleSeed) % TILT_PRESETS.length
                              ];
                            const isNow = act.timeline
                              .toUpperCase()
                              .includes('NOW');

                            return (
                              <button
                                key={act.id}
                                type="button"
                                onClick={() => setActivePassId(act.id)}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] text-left transition-all duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:scale-[1.02] hover:!rotate-0"
                                style={{
                                  backgroundColor: 'var(--art-tile)',
                                  border: isSelected
                                    ? '1px solid var(--art-marker)'
                                    : '1px solid var(--art-line)',
                                  transform: isSelected
                                    ? 'rotate(0deg) translateY(-3px)'
                                    : `rotate(${baseTilt}deg)`,
                                }}
                              >
                                {/* Uniform Header Strip: Monochrome when idle, Vermilion Accent when selected */}
                                <div
                                  className="relative flex items-center justify-between px-2.5 pb-2 pt-3.5 transition-colors duration-200"
                                  style={{
                                    backgroundColor: isSelected
                                      ? 'var(--art-marker)'
                                      : 'var(--art-ground)',
                                    color: isSelected
                                      ? '#ffffff'
                                      : 'var(--art-ink-muted)',
                                    borderBottom: isSelected
                                      ? '1px solid var(--art-marker)'
                                      : '1px solid var(--art-line)',
                                  }}
                                >
                                  {/* Tactile Lanyard Slot Cutout */}
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-1/2 top-1.5 h-[4px] w-7 -translate-x-1/2 rounded-full"
                                    style={{
                                      backgroundColor: isSelected
                                        ? 'rgba(0, 0, 0, 0.28)'
                                        : 'var(--art-tile)',
                                      border: isSelected
                                        ? 'none'
                                        : '1px solid var(--art-line)',
                                    }}
                                  />
                                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em]">
                                    {act.kind === 'volunteering'
                                      ? 'VOLUNTEER'
                                      : 'ORGANIZATION'}
                                  </span>
                                  {isNow && (
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        backgroundColor: isSelected
                                          ? '#ffffff'
                                          : 'var(--art-marker)',
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Pass Body */}
                                <div className="flex flex-1 flex-col justify-between gap-2.5 p-3">
                                  <div>
                                    <p
                                      className="line-clamp-2 text-[12.5px] font-medium leading-[1.35]"
                                      style={{ color: 'var(--art-ink)' }}
                                    >
                                      {act.company}
                                    </p>
                                    <p
                                      className="mt-1 line-clamp-2 text-[11px] leading-[1.4]"
                                      style={{ color: 'var(--art-ink-muted)' }}
                                    >
                                      {act.title}
                                    </p>
                                  </div>

                                  {/* Micro Barcode + Timeline Footer */}
                                  <div
                                    className="flex items-end justify-between gap-1.5 border-t pt-2"
                                    style={{ borderColor: 'var(--art-line)' }}
                                  >
                                    <span
                                      className="truncate font-mono text-[9px] uppercase tracking-[0.04em]"
                                      style={{ color: 'var(--art-ink-muted)' }}
                                    >
                                      {act.timeline}
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className="flex h-2.5 shrink-0 items-end gap-[1.5px] opacity-30"
                                      style={{ color: 'var(--art-ink)' }}
                                    >
                                      <i className="block h-full w-[1.5px] bg-current" />
                                      <i className="block h-[70%] w-[1px] bg-current" />
                                      <i className="block h-full w-[2px] bg-current" />
                                      <i className="block h-[80%] w-[1px] bg-current" />
                                      <i className="block h-full w-[1.5px] bg-current" />
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Pass Spotlight Reader (Monochrome Editorial + Single Vermilion Accent) */}
                        <div
                          className="relative overflow-hidden rounded-[12px] p-5 transition-colors duration-200"
                          style={{
                            backgroundColor: 'var(--art-tile)',
                            border: '1px solid var(--art-line)',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 top-0 w-[2.5px]"
                            style={{ backgroundColor: 'var(--art-marker)' }}
                          />

                          <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em]">
                                <span style={{ color: 'var(--art-marker-text)' }}>
                                  {activePass.kind === 'volunteering'
                                    ? 'VOLUNTEERING'
                                    : 'ORGANIZATION'}
                                </span>
                                <span style={{ color: 'var(--art-ink-muted)' }}>
                                  · {activePass.timeline}
                                </span>
                                {activePass.location && (
                                  <span style={{ color: 'var(--art-ink-muted)' }}>
                                    · {activePass.location}
                                  </span>
                                )}
                              </div>
                              <h3
                                className="text-[15.5px] font-medium leading-snug"
                                style={{ color: 'var(--art-ink)' }}
                              >
                                {activePass.title}{' '}
                                <span
                                  className="font-normal"
                                  style={{ color: 'var(--art-ink-muted)' }}
                                >
                                  @ {activePass.company}
                                </span>
                              </h3>
                            </div>

                            <span
                              className="shrink-0 -rotate-2 rounded-[4px] px-2 py-0.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.12em]"
                              style={{
                                border: isActivePassNow
                                  ? '1px dashed var(--art-marker)'
                                  : '1px dashed var(--art-hairline-strong)',
                                color: isActivePassNow
                                  ? 'var(--art-marker-text)'
                                  : 'var(--art-ink-muted)',
                              }}
                            >
                              {isActivePassNow ? 'ACTIVE' : 'COMPLETED'}
                            </span>
                          </div>

                          {activePass.description && (
                            <p
                              className="mt-3 pl-2 text-[13.5px] leading-[1.65]"
                              style={{ color: 'var(--art-ink-soft)' }}
                            >
                              {activePass.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. COMPETITIONS & HONORS (Compact Click-to-Expand List) */}
                  {(() => {
                    const getRankTag = (title: string) => {
                      const lower = title.toLowerCase();
                      if (lower.includes('1st') || lower.includes('juara 1'))
                        return '1ST PLACE';
                      if (lower.includes('2nd') || lower.includes('juara 2'))
                        return '2ND PLACE';
                      if (lower.includes('3rd') || lower.includes('juara 3'))
                        return '3RD PLACE';
                      if (lower.includes('best')) return 'BEST AWARD';
                      return 'HONOR';
                    };

                    return (
                      <div className="space-y-4">
                        <p
                          className="font-mono text-[11px] uppercase tracking-[0.14em]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          Competitions &amp; Honors ({achievements.length})
                        </p>

                        <div
                          className="divide-y overflow-hidden rounded-[12px]"
                          style={{
                            backgroundColor: 'var(--art-tile)',
                            border: '1px solid var(--art-line)',
                            borderColor: 'var(--art-line)',
                          }}
                        >
                          {achievements.map((ach, idx) => {
                            const isPicked = activeAwardId === ach.id;
                            const rankTag = getRankTag(ach.title);

                            return (
                              <button
                                key={ach.id}
                                type="button"
                                onClick={() =>
                                  setActiveAwardId(isPicked ? null : ach.id)
                                }
                                data-cursor-label={isPicked ? 'close' : 'open'}
                                className="group relative block w-full px-4 py-3.5 text-left transition-colors sm:px-5"
                                style={{
                                  borderColor: 'var(--art-line)',
                                  backgroundColor: isPicked
                                    ? 'var(--art-paper-raised)'
                                    : 'transparent',
                                }}
                              >
                                {/* Left orange indicator bar when open/hovered */}
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute inset-y-0 left-0 w-[2px] transition-opacity duration-200 ${
                                    isPicked
                                      ? 'opacity-100'
                                      : 'opacity-0 group-hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: 'var(--art-marker)' }}
                                />

                                {/* Compact Single Row */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-2.5">
                                    <Trophy
                                      size={14}
                                      className="shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
                                      style={{ color: 'var(--art-marker-text)' }}
                                    />
                                    <h3 className="dev-hover-title truncate text-[14.5px] font-medium">
                                      {ach.title}
                                    </h3>
                                    <span
                                      className="hidden sm:inline-block shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em]"
                                      style={{
                                        backgroundColor: 'var(--art-marker-tint)',
                                        color: 'var(--art-marker-text)',
                                      }}
                                    >
                                      {rankTag}
                                    </span>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                                    <span
                                      className="hidden sm:inline"
                                      style={{ color: 'var(--art-ink-muted)' }}
                                    >
                                      {ach.event}
                                    </span>
                                    <span style={{ color: 'var(--art-ink-soft)' }}>
                                      {ach.year}
                                    </span>
                                    <span
                                      className="flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                                      style={{
                                        backgroundColor: isPicked
                                          ? 'var(--art-marker)'
                                          : 'var(--art-ground)',
                                        color: isPicked
                                          ? 'var(--art-on-marker)'
                                          : 'var(--art-ink-muted)',
                                        border: '1px solid var(--art-line)',
                                      }}
                                    >
                                      {isPicked ? (
                                        <Minus size={12} />
                                      ) : (
                                        <Plus size={12} />
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Smooth CSS Grid Accordion for Competition Details */}
                                <div
                                  className="dev-accordion"
                                  data-open={isPicked ? 'true' : 'false'}
                                  aria-hidden={!isPicked}
                                >
                                  <div className="dev-accordion-inner">
                                    <div
                                      className="mt-3.5 space-y-2.5 border-t border-dashed pt-3.5 pl-6"
                                      style={{
                                        borderColor: 'var(--art-hairline-strong)',
                                      }}
                                    >
                                      <p
                                        className="text-[13.5px] leading-[21px]"
                                        style={{ color: 'var(--art-ink-soft)' }}
                                      >
                                        {ach.desc}
                                      </p>
                                      <div
                                        className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em]"
                                        style={{ color: 'var(--art-ink-muted)' }}
                                      >
                                        <span>
                                          {String(idx + 1).padStart(2, '0')} ·{' '}
                                          {ach.event}
                                        </span>
                                        <span>YEAR · {ach.year}</span>
                                        <span
                                          style={{ color: 'var(--art-marker-text)' }}
                                        >
                                          {rankTag}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. TEARABLE COLLABORATION TICKET + 4-CELL CONTACT BAR */}
                  <div className="space-y-5 pt-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => setTicketTorn((t) => !t)}
                        onMouseEnter={() => setTicketHovered(true)}
                        onMouseLeave={() => setTicketHovered(false)}
                        data-cursor-label={ticketTorn ? 'close' : 'tear'}
                        className="relative flex w-full items-stretch text-left"
                      >
                        <div
                          className="flex flex-1 flex-col justify-between rounded-l-[10px] px-5 py-4"
                          style={{
                            backgroundColor: 'var(--art-paper-raised)',
                            border: '1px solid var(--art-line)',
                            borderRight: 'none',
                          }}
                        >
                          <span
                            className="font-mono text-[10px] uppercase tracking-[0.12em]"
                            style={{ color: 'var(--art-marker-text)' }}
                          >
                            COLLABORATION · {statusText.toUpperCase()}
                          </span>
                          <p className="mt-1 text-[16px] font-medium">
                            Want to build or collaborate together?
                          </p>
                          <p
                            className="mt-0.5 text-[13px]"
                            style={{ color: 'var(--art-ink-soft)' }}
                          >
                            Full-stack Next.js apps, interactive UI, automation
                            &amp; systems.
                          </p>
                        </div>

                        <div
                          className="relative flex w-[112px] shrink-0 flex-col items-center justify-center rounded-r-[10px] px-3 py-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          style={{
                            transform: ticketTorn
                              ? 'translateX(14px) rotate(5deg)'
                              : ticketHovered
                              ? 'translateX(3px) rotate(1.5deg)'
                              : 'translateX(0px) rotate(0deg)',
                            backgroundColor: ticketTorn
                              ? 'var(--art-marker)'
                              : 'var(--art-paper-raised)',
                            color: ticketTorn
                              ? 'var(--art-on-marker)'
                              : 'var(--art-ink)',
                            border: '1px solid var(--art-line)',
                            borderLeft: 'none',
                          }}
                        >
                          <span className="art-ticket-notch-top" />
                          <span className="art-ticket-notch-bottom" />
                          <div className="pointer-events-none absolute inset-y-2 left-0 flex flex-col justify-between">
                            {Array.from({ length: 8 }).map((_, dotIdx) => (
                              <span
                                key={dotIdx}
                                className="h-[3px] w-[3px] rounded-full transition-colors"
                                style={{
                                  backgroundColor:
                                    ticketHovered || ticketTorn
                                      ? 'var(--art-marker)'
                                      : 'var(--art-hairline-strong)',
                                }}
                              />
                            ))}
                          </div>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                            {ticketTorn ? 'CLOSE' : 'TEAR HERE'}
                          </span>
                        </div>
                      </button>

                      {/* Smooth CSS Grid Accordion for Tearable Ticket Panel */}
                      <div
                        className="dev-accordion"
                        data-open={ticketTorn ? 'true' : 'false'}
                        aria-hidden={!ticketTorn}
                      >
                        <div className="dev-accordion-inner">
                          <div
                            className="mt-3 space-y-4 rounded-[12px] p-5"
                            style={{
                              backgroundColor: 'var(--art-tile)',
                              border: '1px solid var(--art-line)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="font-mono text-[11px] uppercase tracking-[0.14em]"
                                style={{ color: 'var(--art-marker-text)' }}
                              >
                                TICKET TORN · LET&apos;S BUILD
                              </span>
                              <span
                                className="font-mono text-[11px]"
                                style={{ color: 'var(--art-ink-muted)' }}
                              >
                                Makassar (WITA)
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
                                style={{
                                  backgroundColor: 'var(--art-marker)',
                                  color: 'var(--art-on-marker)',
                                }}
                              >
                                <span>Open Contact Form</span>
                                <ArrowUpRight size={14} />
                              </Link>
                              <a
                                href={`mailto:${emailAddress}`}
                                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px]"
                                style={{
                                  backgroundColor: 'var(--art-paper-raised)',
                                  border: '1px solid var(--art-line)',
                                }}
                              >
                                <span>Email Directly</span>
                                <ArrowUpRight size={13} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-2 overflow-hidden rounded-[10px] sm:grid-cols-4"
                      style={{ border: '1px solid var(--art-line)' }}
                    >
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        data-cursor-label={copiedEmail ? 'copied' : 'copy'}
                        className="flex flex-col items-start gap-1 p-3.5 text-left"
                        style={{
                          backgroundColor: 'var(--art-tile)',
                          borderRight: '1px solid var(--art-line)',
                        }}
                      >
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          EMAIL
                        </span>
                        <span className="w-full truncate text-[12px] font-medium">
                          {copiedEmail ? 'Copied ✓' : emailAddress}
                        </span>
                      </button>

                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="visit"
                        className="flex flex-col items-start gap-1 p-3.5"
                        style={{
                          backgroundColor: 'var(--art-tile)',
                          borderRight: '1px solid var(--art-line)',
                        }}
                      >
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          GITHUB
                        </span>
                        <span className="text-[12px] font-medium">
                          @Adrianbahri
                        </span>
                      </a>

                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="visit"
                        className="flex flex-col items-start gap-1 p-3.5"
                        style={{
                          backgroundColor: 'var(--art-tile)',
                          borderRight: '1px solid var(--art-line)',
                        }}
                      >
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          LINKEDIN
                        </span>
                        <span className="text-[12px] font-medium">
                          in/adrianbahri
                        </span>
                      </a>

                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="visit"
                        className="flex flex-col items-start gap-1 p-3.5"
                        style={{ backgroundColor: 'var(--art-tile)' }}
                      >
                        <span
                          className="font-mono text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          INSTAGRAM
                        </span>
                        <span className="text-[12px] font-medium">
                          @adrianbahri
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-VIEW 3: WRITING (#writing — Live Articles from Supabase)
          ================================================================== */}
          {activeView === 'writing' && (
            <div key="dev-writing">
              <SubViewTopBar sectionLabel="WRITING" />

              <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8 md:flex-row md:gap-12 lg:gap-16">
                <aside className="flex items-center gap-4 md:sticky md:top-20 md:block md:w-[248px] md:space-y-4 md:self-start">
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    data-cursor-label="home"
                    className="relative block h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[12px] transition-transform hover:scale-[1.03] md:h-[120px] md:w-[120px]"
                    style={{
                      viewTransitionName:
                        morphKey === 'writing'
                          ? 'active-tile-morph'
                          : undefined,
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    <Image
                      src={latestArticle.img}
                      alt="Back to index"
                      fill
                      className="object-cover"
                    />
                  </button>
                  <div className="min-w-0 space-y-1 md:space-y-2">
                    <h1 className="text-[18px] font-semibold tracking-[-0.01em] md:text-[20px]">
                      Writing
                    </h1>
                    <p
                      className="text-[13px] leading-[19px] md:text-[14px] md:leading-[21px]"
                      style={{ color: 'var(--art-ink-soft)' }}
                    >
                      Essays and technical notes on web engineering, design
                      systems, and creative technology.
                    </p>
                  </div>
                </aside>

                <div className="max-w-[720px] flex-1 space-y-3 sm:space-y-4">
                  {(articles.length > 0 ? articles : [latestArticle]).map(
                    (article, idx) => (
                      <Link
                        key={article.id}
                        href={article.slug ? `/blog/${article.slug}` : '/blog'}
                        onMouseEnter={() => {
                          if (article.slug) router.prefetch(`/blog/${article.slug}`);
                        }}
                        onClick={(e) => {
                          saveScrollForView('writing');
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                          e.preventDefault();
                          navigateWithCirclePortal(
                            article.slug ? `/blog/${article.slug}` : '/blog',
                            router,
                            e
                          );
                        }}
                        data-cursor-label="read"
                        className="dev-scaffold-card group flex flex-row items-center gap-3.5 rounded-[12px] p-3.5 transition-colors sm:gap-4 sm:p-4"
                        style={{
                          backgroundColor: 'var(--art-tile)',
                          border: '1px solid var(--art-line)',
                          ['--scaffold-delay' as string]: `${idx * 90}ms`,
                        }}
                      >
                        <div className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[8px] sm:h-[110px] sm:w-[150px]">
                          <Image
                            src={article.img}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="min-w-0 space-y-1 sm:space-y-1.5">
                          <span
                            className="block truncate font-mono text-[9.5px] uppercase tracking-[0.12em] sm:text-[10px]"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            {article.date} · {article.category}
                          </span>
                          <h2 className="dev-hover-title line-clamp-2 text-[14.5px] font-medium leading-snug sm:text-[16px]">
                            {article.title}
                          </h2>
                          <p
                            className="line-clamp-2 text-[12.5px] leading-[18px] sm:text-[13px] sm:leading-[19px]"
                            style={{ color: 'var(--art-ink-soft)' }}
                          >
                            {article.excerpt}
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              SUB-VIEW 5: ACTIVITY & DESK (#resources / #activity)
          ================================================================== */}
          {activeView === 'resources' && (
            <div key="dev-resources">
              <SubViewTopBar sectionLabel="ACTIVITY" />

              <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8 md:flex-row md:gap-12 lg:gap-16">
                <aside className="space-y-4 md:sticky md:top-20 md:w-[248px] md:space-y-5 md:self-start">
                  <div className="flex items-center gap-4 md:block md:space-y-5">
                    <button
                      type="button"
                      onClick={() => navigateTo('home')}
                      data-cursor-label="home"
                      className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] backdrop-blur-md transition-transform hover:scale-[1.03] cursor-pointer md:h-[120px] md:w-[120px]"
                      style={{
                        viewTransitionName:
                          morphKey === 'resources'
                            ? 'active-tile-morph'
                            : undefined,
                        backgroundColor: 'var(--art-tile)',
                        border: '1px solid var(--art-line)',
                      }}
                    >
                      {activityGifs.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activityGifs[activityGifIdx % activityGifs.length]}
                          alt="Activity GIF"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            theme === 'dark'
                              ? '/images/activity-frame-1-dark.png'
                              : '/images/activity-frame-1.png'
                          }
                          alt="Activity desk illustration"
                          width={120}
                          height={120}
                          className="h-full w-full object-contain p-1.5"
                        />
                      )}
                    </button>
                    <div className="min-w-0 space-y-1 md:space-y-2">
                      <h1 className="text-[18px] font-semibold tracking-[-0.01em] md:text-[20px]">
                        Activity
                      </h1>
                      <p
                        className="text-[13px] leading-[19px] md:text-[14px] md:leading-[21px]"
                        style={{ color: 'var(--art-ink-soft)' }}
                      >
                        Music on rotation, the engineering stack I build with,
                        live GitHub activity, and more.
                      </p>
                    </div>
                  </div>

                  {/* Selected Tech Stack Projects Inspector (Docked cleanly under Activity — zero grid distortion) */}
                  {(() => {
                    if (!selectedToolName) return null;
                    const selectedTool = techStack.find(
                      (t) => t.name === selectedToolName
                    );
                    if (!selectedTool) return null;
                    const toolProjects = selectedTool.projects ?? [];
                    const pct = selectedTool.usage ?? 75;
                    return (
                      <div
                        key={selectedTool.name}
                        className="mt-5 rounded-[12px] p-3.5 animate-in fade-in duration-200"
                        style={{
                          backgroundColor: 'var(--art-paper-raised)',
                          border: '1px solid var(--art-marker)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center text-[17px]"
                              style={{ color: 'var(--art-marker-text)' }}
                            >
                              <selectedTool.icon />
                            </span>
                            <div className="min-w-0">
                              <p
                                className="truncate text-[13px] font-medium leading-tight"
                                style={{ color: 'var(--art-ink)' }}
                              >
                                {selectedTool.name}
                              </p>
                              <p
                                className="mt-0.5 font-mono text-[10px] tabular-nums"
                                style={{ color: 'var(--art-marker-text)' }}
                              >
                                {pct}% USAGE
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedToolName(null)}
                            aria-label="Close tech stack projects"
                            className="cursor-pointer rounded-[6px] px-1.5 py-0.5 font-mono text-[10px] uppercase transition-opacity hover:opacity-80"
                            style={{
                              color: 'var(--art-ink-muted)',
                              border: '1px solid var(--art-line)',
                            }}
                          >
                            ×
                          </button>
                        </div>

                        {selectedTool.role && (
                          <p
                            className="mt-2 text-[11px] leading-relaxed"
                            style={{ color: 'var(--art-ink-muted)' }}
                          >
                            {selectedTool.role}
                          </p>
                        )}

                        {toolProjects.length > 0 ? (
                          <div
                            className="mt-3 space-y-1.5 border-t border-dashed pt-2.5"
                            style={{
                              borderColor: 'var(--art-hairline-strong)',
                            }}
                          >
                            <p
                              className="font-mono text-[9px] uppercase tracking-[0.12em]"
                              style={{ color: 'var(--art-ink-muted)' }}
                            >
                              USED IN ({toolProjects.length})
                            </p>
                            <ul className="space-y-1">
                              {toolProjects.map((proj) => (
                                <li key={proj.title}>
                                  {proj.href ? (
                                    <a
                                      href={proj.href}
                                      target={
                                        proj.href.startsWith('http')
                                          ? '_blank'
                                          : undefined
                                      }
                                      rel={
                                        proj.href.startsWith('http')
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                      className="flex items-center justify-between gap-2 rounded-[6px] px-2 py-1 text-[11px] transition-colors hover:bg-black/10"
                                    >
                                      <span
                                        className="dev-hover-title truncate font-medium"
                                        style={{ color: 'var(--art-ink)' }}
                                      >
                                        {proj.title}
                                      </span>
                                      <span
                                        className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.08em]"
                                        style={{
                                          color: 'var(--art-marker-text)',
                                        }}
                                      >
                                        {proj.tag} ↗
                                      </span>
                                    </a>
                                  ) : (
                                    <div className="flex items-center justify-between gap-2 rounded-[6px] px-2 py-1 text-[11px]">
                                      <span
                                        className="truncate"
                                        style={{
                                          color: 'var(--art-ink-soft)',
                                        }}
                                      >
                                        {proj.title}
                                      </span>
                                      <span
                                        className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.08em]"
                                        style={{
                                          color: 'var(--art-ink-muted)',
                                        }}
                                      >
                                        {proj.tag}
                                      </span>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p
                            className="mt-3 border-t border-dashed pt-2.5 font-mono text-[10px]"
                            style={{
                              borderColor: 'var(--art-hairline-strong)',
                              color: 'var(--art-ink-muted)',
                            }}
                          >
                            Core workflow tool across active projects.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </aside>

                <div className="max-w-[720px] flex-1 space-y-10">
                  {/* 01 / ON ROTATION — Spotify Cassette Tape Player & Top This Month */}
                  <section
                    aria-labelledby="resources-music-heading"
                    className="dev-enter-section space-y-3.5"
                    style={{ ['--section-delay' as string]: '0ms' }}
                  >
                    <div
                      className="flex items-center justify-between border-b pb-2.5"
                      style={{ borderColor: 'var(--art-line)' }}
                    >
                      <h2
                        id="resources-music-heading"
                        className="font-mono text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: 'var(--art-ink)' }}
                      >
                        <span style={{ color: 'var(--art-marker-text)' }}>01</span>{' '}
                        / ON ROTATION
                      </h2>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        SPOTIFY
                      </span>
                    </div>
                    <SpotifyNowPlaying />
                  </section>

                  {/* 02 / ENGINEERING & GITHUB */}
                  <section
                    aria-labelledby="resources-github-heading"
                    className="dev-enter-section space-y-3.5"
                    style={{ ['--section-delay' as string]: '110ms' }}
                  >
                    <div
                      className="flex items-center justify-between border-b pb-2.5"
                      style={{ borderColor: 'var(--art-line)' }}
                    >
                      <h2
                        id="resources-github-heading"
                        className="font-mono text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: 'var(--art-ink)' }}
                      >
                        <span style={{ color: 'var(--art-marker-text)' }}>02</span>{' '}
                        / ENGINEERING &amp; GITHUB
                      </h2>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        PUBLIC &amp; PRIVATE ORGS
                      </span>
                    </div>

                    <GitHubActivity />
                  </section>

                  {/* 03 / TECH STACK & AI WORKFLOW (Grouped by category, ranked by project usage %) */}
                  <section
                    aria-labelledby="resources-stack-heading"
                    className="dev-enter-section dev-cv-auto space-y-5"
                    style={{ ['--section-delay' as string]: '220ms' }}
                  >
                    <div
                      className="flex items-center justify-between border-b pb-2.5"
                      style={{ borderColor: 'var(--art-line)' }}
                    >
                      <h2
                        id="resources-stack-heading"
                        className="font-mono text-[11px] uppercase tracking-[0.14em]"
                        style={{ color: 'var(--art-ink)' }}
                      >
                        <span style={{ color: 'var(--art-marker-text)' }}>03</span>{' '}
                        / TECH STACK &amp; AI WORKFLOW
                      </h2>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        CLICK TO INSPECT · {String(devTools.length).padStart(2, '0')} TOOLS
                      </span>
                    </div>

                    {(
                      [
                        {
                          key: 'ai',
                          title: 'AI & Agentic Workflow',
                          subtitle: 'Primary engineering multipliers',
                        },
                        {
                          key: 'languages',
                          title: 'Programming, Query & Markup Languages',
                          subtitle: 'Core languages & raw SQL',
                        },
                        {
                          key: 'frameworks',
                          title: 'Frameworks & UI Libraries',
                          subtitle: 'Web, mobile, motion & API frameworks',
                        },
                        {
                          key: 'databases',
                          title: 'Databases, ORM & Data Engineering',
                          subtitle: 'Relational SQL, caches, ORMs & ML pipelines',
                        },
                        {
                          key: 'backend',
                          title: 'Backend Runtime, Cloud & DevOps Infra',
                          subtitle: 'Runtimes, servers, storage & IaC',
                        },
                      ] as const
                    ).map((group) => {
                      const groupTools = devTools.filter(
                        (t) => (t.category || 'backend') === group.key
                      );
                      if (groupTools.length === 0) return null;

                      return (
                        <div key={group.key} className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className="font-mono text-[10px] uppercase tracking-[0.14em]"
                              style={{ color: 'var(--art-ink)' }}
                            >
                              {group.title}
                            </span>
                            <span
                              className="font-mono text-[9.5px]"
                              style={{ color: 'var(--art-ink-muted)' }}
                            >
                              {group.subtitle} · {String(groupTools.length).padStart(2, '0')}
                            </span>
                          </div>

                          <div
                            className={`grid grid-cols-1 gap-3 ${
                              group.key === 'ai'
                                ? 'sm:grid-cols-2'
                                : 'sm:grid-cols-2 lg:grid-cols-3'
                            }`}
                          >
                            {groupTools.map((tool, idx) => {
                              const pct = tool.usage ?? 75;
                              const isFeatured = Boolean(tool.featured);
                              const isOpen = selectedToolName === tool.name;
                              const toolProjects = tool.projects ?? [];
                              return (
                                <div
                                  key={tool.name}
                                  className="group dev-enter-card dev-scaffold-card flex flex-col justify-between rounded-[12px] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--art-marker)]"
                                  style={{
                                    backgroundColor:
                                      isFeatured || isOpen
                                        ? 'var(--art-paper-raised)'
                                        : 'var(--art-tile)',
                                    border: isOpen
                                      ? '1px solid var(--art-marker)'
                                      : isFeatured
                                      ? '1px solid var(--art-hairline-strong)'
                                      : '1px solid var(--art-line)',
                                    ['--scaffold-delay' as string]: `${idx * 45}ms`,
                                    ['--enter-delay' as string]: `${160 + idx * 40}ms`,
                                  }}
                                >
                                  <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    data-cursor-label={
                                      isOpen ? 'close' : 'projects'
                                    }
                                    onClick={() =>
                                      setSelectedToolName((prev) =>
                                        prev === tool.name ? null : tool.name
                                      )
                                    }
                                    className="w-full cursor-pointer space-y-2.5 text-left"
                                  >
                                    <div className="flex items-center justify-between gap-2.5">
                                      <div className="flex min-w-0 items-center gap-2.5">
                                        <span
                                          className="dev-hover-title flex h-8 w-8 shrink-0 items-center justify-center text-[19px] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6"
                                          style={{
                                            color:
                                              isFeatured || isOpen
                                                ? 'var(--art-marker-text)'
                                                : 'var(--art-ink)',
                                          }}
                                        >
                                          <tool.icon />
                                        </span>
                                        <div className="min-w-0">
                                          <p className="dev-hover-title truncate text-[13px] font-medium leading-tight">
                                            {tool.name}
                                          </p>
                                          {tool.role && (
                                            <p
                                              className="mt-0.5 truncate text-[10.5px]"
                                              style={{
                                                color: 'var(--art-ink-muted)',
                                              }}
                                            >
                                              {tool.role}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <span
                                        className="shrink-0 font-mono text-[11px] font-semibold tabular-nums"
                                        style={{
                                          color:
                                            isFeatured || isOpen
                                              ? 'var(--art-marker-text)'
                                              : 'var(--art-ink)',
                                        }}
                                      >
                                        {pct}%
                                      </span>
                                    </div>

                                    {/* Animated Project Usage Percentage Bar */}
                                    <div
                                      className="h-[3.5px] w-full overflow-hidden rounded-full"
                                      style={{
                                        backgroundColor: 'var(--art-hairline)',
                                      }}
                                    >
                                      <div
                                        className="dev-timeline-bar h-full rounded-full"
                                        style={{
                                          width: `${pct}%`,
                                          backgroundColor:
                                            isFeatured || isOpen
                                              ? 'var(--art-marker)'
                                              : 'var(--art-ink)',
                                          opacity:
                                            isFeatured || isOpen ? 1 : 0.72,
                                          ['--bar-delay' as string]: `${200 + idx * 45}ms`,
                                        }}
                                      />
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                </div>
              </div>
            </div>
          )}

      </div>
    </div>
  );
}
