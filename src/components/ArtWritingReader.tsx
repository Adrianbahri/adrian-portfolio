'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import {
  applyThemePreference,
  runThemeTransition,
  subscribeThemeStorage,
} from '@/lib/themeTransition';
import { navigateWithCirclePortal } from '@/lib/portalTransition';

export interface CreativeArticleDetail {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  coverImage?: string;
  role: 'written' | 'edited';
  date: string;
}

export default function ArtWritingReader({
  article,
}: {
  article: CreativeArticleDetail;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
    } else if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
    const unsub = subscribeThemeStorage((next) => setTheme(next));
    return () => unsub();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/art#writing');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

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

  const isDark = theme === 'dark';
  const palette = isDark
    ? {
        bg: '#0B0B0B',
        surface: '#141414',
        border: '#272727',
        ink: '#F2EFE9',
        inkSoft: '#C6C2B9',
        inkMuted: '#7E7A72',
        accent: '#EA6A12',
      }
    : {
        bg: '#F2EFE9',
        surface: '#E6E2D9',
        border: '#D0CBBF',
        ink: '#141413',
        inkSoft: '#35332F',
        inkMuted: '#656159',
        accent: '#D95B08',
      };

  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(article.content || '');
  const plainParagraphs = !isHtmlContent
    ? (article.content || article.description || '')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      data-dev-theme={theme}
      className="min-h-screen w-full transition-colors duration-300 selection:bg-[#EA6A12] selection:text-[#0B0B0B]"
      style={{
        backgroundColor: palette.bg,
        color: palette.ink,
      }}
    >
      {/* Ultra-Thin Swiss Midpoint Utility Bar (28px, WRITING active) */}
      <header
        className="fixed inset-x-0 top-0 z-50 w-full"
        style={{ backgroundColor: palette.bg }}
      >
        <div className="grid h-[28px] w-full grid-cols-2 items-center px-2.5 sm:px-3 font-sans text-[11px] font-normal uppercase tracking-[-0.25px]">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={(e) => navigateWithCirclePortal('/', router, e)}
              className="inline-flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: palette.inkMuted }}
            >
              <ArrowLeft size={10} aria-hidden="true" />
              <span>DEV</span>
            </button>
            <Link
              href="/art"
              className="hidden sm:inline font-normal normal-case transition-opacity hover:opacity-75"
              style={{ color: palette.ink }}
            >
              Adrian (Dri4n)
            </Link>
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
              <Link
                href="/art#photo"
                className="transition-opacity hover:underline hover:underline-offset-[2px]"
                style={{ color: palette.inkMuted }}
              >
                PHOTO
              </Link>
              <Link
                href="/art#media-production"
                className="transition-opacity hover:underline hover:underline-offset-[2px]"
                style={{ color: palette.inkMuted }}
              >
                MEDSOS
              </Link>
              <Link
                href="/art#print-works"
                className="transition-opacity hover:underline hover:underline-offset-[2px]"
                style={{ color: palette.inkMuted }}
              >
                PRINT
              </Link>
              <Link
                href="/art#writing"
                className="underline underline-offset-[2px]"
                style={{ color: palette.ink }}
              >
                WRITING
              </Link>
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

      {/* Floating Top-Right 30x30px Square Close Button -> Back to /art#writing */}
      <Link
        href="/art#writing"
        aria-label="Close article and return to writing list"
        className="fixed right-2.5 top-[38px] z-40 flex h-[30px] w-[30px] items-center justify-center rounded-none transition-opacity hover:opacity-80"
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          color: palette.inkMuted,
        }}
      >
        <X size={14} aria-hidden="true" />
      </Link>

      {/* 2-Column Swiss Journal Reader (Left: Square Cover + Right-Aligned Title | Right: Clean Prose) */}
      <main
        id="main-content"
        className="w-full px-5 pb-28 pt-24 sm:px-8 sm:pt-32 lg:px-10"
      >
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2 md:gap-0">
          {/* Left Sticky Column: Square Sharp Cover Above Uppercase Right-Aligned Title */}
          <aside className="flex flex-col md:sticky md:top-[112px] md:self-start md:items-end md:pr-[84px] md:text-right lg:pr-[111px]">
            {article.coverImage && (
              <div
                className="mb-6 aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-none"
                style={{ backgroundColor: palette.surface }}
              >
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="block h-full w-full object-cover"
                />
              </div>
            )}

            <h1
              className="max-w-[300px] font-sans text-[14px] font-normal uppercase leading-[1.45] tracking-[-0.01em]"
              style={{ color: palette.ink }}
            >
              {article.title}
            </h1>

            <p
              className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.06em]"
              style={{ color: palette.inkMuted }}
            >
              {article.role === 'edited' ? 'EDITED BY ADRIAN' : 'BY ADRIAN'} ·{' '}
              {article.date}
            </p>
          </aside>

          {/* Right Column: Clean Swiss Editorial Reading Column */}
          <article
            className="max-w-[500px] font-sans text-[14px] leading-[1.68] tracking-[-0.01em]"
            style={{ color: palette.inkSoft }}
          >
            {isHtmlContent ? (
              <div
                className="space-y-5 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:pt-3 [&_h2]:text-[15px] [&_h2]:font-medium [&_h2]:uppercase [&_h3]:pt-2 [&_h3]:text-[14px] [&_h3]:font-medium [&_img]:my-6 [&_img]:w-full [&_img]:rounded-none [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <div className="space-y-5">
                {plainParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
