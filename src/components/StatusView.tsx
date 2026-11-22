'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Moon, RotateCcw, Sun } from 'lucide-react';
import { ArtCursor } from '@/components/ArtCursor';
import {
  applyThemePreference,
  runThemeTransition,
  subscribeThemeStorage,
} from '@/lib/themeTransition';
import { navigateWithCirclePortal } from '@/lib/portalTransition';
import '@/styles/shahriyar.css';

interface StatusViewProps {
  code: '404' | '500';
  onReset?: () => void;
}

export default function StatusView({ code, onReset }: StatusViewProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const isCreative =
    pathname.startsWith('/art') || pathname.startsWith('/creative');

  // Default Dark Mode everywhere unless user explicitly saved 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    return subscribeThemeStorage((next) => setTheme(next));
  }, []);

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

  // =========================================================================
  // CREATIVE / ART MODE (/art/*) — Gaurav Mishra Swiss-Grid Aesthetic
  // =========================================================================
  if (isCreative) {
    const c =
      theme === 'dark'
        ? {
            bg: '#0A0A0A',
            ink: '#FFFFFF',
            ink2: '#D4D4D4',
            muted: '#8A8A8A',
            hair: '#3A3A3A',
            divider: 'rgba(255, 255, 255, 0.12)',
          }
        : {
            bg: '#FFFFFF',
            ink: '#000000',
            ink2: '#313131',
            muted: '#757575',
            hair: '#D9D9D9',
            divider: 'rgba(0, 0, 0, 0.1)',
          };

    const heading =
      code === '404' ? '404 / FRAME NOT FOUND' : '500 / EXHIBITION INTERRUPTED';
    const copy =
      code === '404'
        ? 'THE VISUAL PIECE OR ARCHIVE ROUTE YOU REQUESTED DOES NOT EXIST OR HAS BEEN MOVED TO ANOTHER COLLECTION.'
        : 'AN UNEXPECTED INTERRUPTION OCCURRED WHILE LOADING THIS ARCHIVE VIEW. TRY RELOADING OR RETURN TO THE MAIN GALLERY.';

    return (
      <div
        data-dev-theme={theme}
        className="dev-shell art-custom-cursor-active relative min-h-screen w-full text-[12px] leading-[1.2] antialiased selection:bg-[#ff5a3d] selection:text-white"
        style={{ backgroundColor: c.bg, color: c.ink }}
      >
        <ArtCursor />

        <header
          className="fixed left-0 right-0 top-0 z-30 w-full uppercase"
          style={{
            backgroundColor: c.bg,
            borderBottom: `1px solid ${c.divider}`,
            letterSpacing: '-0.34px',
          }}
        >
          <div className="flex items-center justify-between px-3 py-2.5 md:grid md:h-[32px] md:grid-cols-2 md:px-[10px] md:py-0">
            <div className="flex items-center gap-4">
              <Link
                href="/art"
                className="underline-offset-[3px] hover:underline"
              >
                ©ADRIAN
              </Link>
              <button
                type="button"
                onClick={(e) => navigateWithCirclePortal('/', router, e)}
                className="underline-offset-[3px] hover:underline"
                style={{ color: c.muted }}
              >
                ← DEV SIDE
              </button>
            </div>

            <div className="flex items-center justify-end gap-4 md:justify-between">
              <Link
                href="/art"
                className="hidden md:inline-block underline-offset-[3px] hover:underline"
              >
                ARCHIVE
              </Link>
              <div className="flex items-center gap-1.5">
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
            </div>
          </div>
        </header>

        <main className="px-[10px] pt-[120px] uppercase md:pt-[180px]">
          <div className="md:ml-[50%] md:max-w-[540px] space-y-6">
            <p
              className="font-mono text-[10.5px] tracking-[0.14em]"
              style={{ color: c.muted }}
            >
              {heading}
            </p>

            <h1 className="text-[48px] font-medium leading-none tracking-[-0.04em] sm:text-[72px]">
              {code}
            </h1>

            <p className="leading-[17px]" style={{ color: c.ink2 }}>
              {copy}
            </p>

            <div
              className="flex flex-wrap items-center gap-5 pt-5"
              style={{ borderTop: `1px solid ${c.divider}` }}
            >
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="underline underline-offset-[3px] hover:opacity-75"
                >
                  TRY AGAIN
                </button>
              )}
              <Link
                href="/art"
                className="underline underline-offset-[3px] hover:opacity-75"
              >
                RETURN TO ARCHIVE ↗
              </Link>
              <button
                type="button"
                onClick={(e) => navigateWithCirclePortal('/', router, e)}
                className="underline-offset-[3px] hover:underline"
                style={{ color: c.muted }}
              >
                SWITCH TO DEV SIDE
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // DEV MODE (Default) — Shahriyar Editorial Minimalist Aesthetic
  // =========================================================================
  const title =
    code === '404'
      ? 'This route doesn’t exist in the index.'
      : 'Something interrupted the render pipeline.';
  const desc =
    code === '404'
      ? `No page was found at "${pathname}". It may have been moved, renamed, or never deployed.`
      : 'An unexpected server or runtime exception occurred. You can retry the request or head back to the main index.';

  return (
    <div
      data-dev-theme={theme}
      className="dev-shell art-custom-cursor-active relative flex min-h-screen w-full flex-col justify-between selection:bg-[#ff5a3d] selection:text-[#141414]"
    >
      <ArtCursor />

      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center px-4 py-16 sm:px-0">
        {/* Top Row: Status Badge + Theme Toggle */}
        <div className="mb-10 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em]"
            style={{
              backgroundColor: 'var(--art-marker-tint)',
              color: 'var(--art-marker-text)',
              border: '1px solid var(--art-marker)',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: 'var(--art-marker)' }}
            />
            {code === '404' ? '404 · NOT FOUND' : '500 · SYSTEM ERROR'}
          </span>

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
                transform:
                  theme === 'dark' ? 'translateX(24px)' : 'translateX(0px)',
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
              className="relative z-10 flex h-full w-1/2 items-center justify-center"
              style={{
                color:
                  theme === 'light' ? 'var(--art-ink)' : 'var(--art-ink-muted)',
              }}
            >
              <Sun size={12} />
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'dark'}
              aria-label="Dark mode"
              onClick={(e) => switchTheme('dark', e)}
              className="relative z-10 flex h-full w-1/2 items-center justify-center"
              style={{
                color:
                  theme === 'dark' ? 'var(--art-ink)' : 'var(--art-ink-muted)',
              }}
            >
              <Moon size={12} />
            </button>
          </div>
        </div>

        {/* Crisp Editorial Error Card */}
        <div
          className="rounded-[16px] p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        >
          <p
            className="font-mono text-[44px] font-semibold leading-none tracking-[-0.04em] sm:text-[56px]"
            style={{ color: 'var(--art-ink)' }}
          >
            {code}
          </p>

          <h1
            className="mt-4 text-[18px] font-medium leading-snug sm:text-[20px]"
            style={{ color: 'var(--art-ink)' }}
          >
            {title}
          </h1>

          <p
            className="mt-2.5 text-[14px] leading-[22px]"
            style={{ color: 'var(--art-ink-soft)' }}
          >
            {desc}
          </p>

          <div
            className="mt-6 flex flex-wrap items-center gap-2.5 pt-5"
            style={{ borderTop: '1px solid var(--art-line)' }}
          >
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--art-marker)',
                  color: 'var(--art-on-marker)',
                }}
              >
                <RotateCcw size={13} />
                <span>Try again</span>
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-85"
              style={{
                backgroundColor: onReset
                  ? 'var(--art-ground)'
                  : 'var(--art-ink)',
                color: onReset ? 'var(--art-ink)' : 'var(--art-ground)',
                border: '1px solid var(--art-line)',
              }}
            >
              <ArrowLeft size={13} />
              <span>Back to Index</span>
            </Link>

            <button
              type="button"
              onClick={(e) => navigateWithCirclePortal('/art', router, e)}
              className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--art-ground)',
                color: 'var(--art-ink-soft)',
                border: '1px solid var(--art-line)',
              }}
            >
              <span>Creative Side</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
