'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { ArtCursor } from '@/components/ArtCursor';
import { runThemeTransition } from '@/lib/themeTransition';
import '@/styles/shahriyar.css';

export interface MetaField {
  label: string;
  value: ReactNode;
}

interface ShahriyarDetailShellProps {
  backHref: string;
  sectionName: string;
  breadcrumbTitle: string;
  metaFields: MetaField[];
  children: ReactNode;
}

export default function ShahriyarDetailShell({
  backHref,
  sectionName,
  breadcrumbTitle,
  metaFields,
  children,
}: ShahriyarDetailShellProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const switchTheme = (
    next: 'dark' | 'light',
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(backHref);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router, backHref]);

  return (
    <div
      data-dev-theme={theme}
      className="dev-shell art-custom-cursor-active relative min-h-screen w-full selection:bg-[#ff5a3d] selection:text-[#141414]"
    >
      <ArtCursor />

      <div className="relative z-10">
        {/* Sticky Top Bar (Exact Shahriyar Article/Project Bar) */}
        <header
          className="sticky top-0 z-40 w-full"
          style={{
            backgroundColor: 'var(--art-ground)',
            borderBottom: '1px solid var(--art-line)',
          }}
        >
          <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-opacity hover:opacity-85"
              style={{
                backgroundColor: 'var(--art-tile)',
                color: 'var(--art-ink)',
                border: '1px solid var(--art-line)',
              }}
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>

            <div
              className="hidden sm:flex min-w-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: 'var(--art-ink-muted)' }}
            >
              <Link href="/" className="shrink-0 opacity-75 hover:opacity-100">
                INDEX
              </Link>
              <span className="shrink-0">/</span>
              <Link
                href={backHref}
                className="shrink-0 opacity-75 hover:opacity-100"
              >
                {sectionName}
              </Link>
              <span className="shrink-0">/</span>
              <span
                className="truncate"
                style={{ color: 'var(--art-ink)' }}
              >
                {breadcrumbTitle}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {/* Segmented Theme Toggle */}
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
                  className="relative z-10 flex h-full w-1/2 items-center justify-center"
                  style={{
                    color:
                      theme === 'light'
                        ? 'var(--art-ink)'
                        : 'var(--art-ink-muted)',
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
                      theme === 'dark'
                        ? 'var(--art-ink)'
                        : 'var(--art-ink-muted)',
                  }}
                >
                  <Moon size={12} />
                </button>
              </div>

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
            </div>
          </div>
        </header>

        {/* 2-Column Editorial Detail Layout */}
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-8 sm:pb-24 sm:pt-10 md:flex-row md:gap-14 lg:gap-20">
          {/* Left Sticky Metadata Aside (248px) */}
          <aside className="md:sticky md:top-24 md:w-[248px] md:self-start">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 md:grid-cols-1 md:gap-y-5">
              {metaFields.map((field) => (
                <div key={field.label} className="space-y-1">
                  <dt
                    className="font-mono text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: 'var(--art-ink-muted)' }}
                  >
                    {field.label}
                  </dt>
                  <dd
                    className="text-[13.5px] leading-[20px]"
                    style={{ color: 'var(--art-ink)' }}
                  >
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>

          {/* Right Reading / Case Study Column */}
          <article className="min-w-0 max-w-[680px] flex-1">{children}</article>
        </div>
      </div>
    </div>
  );
}
