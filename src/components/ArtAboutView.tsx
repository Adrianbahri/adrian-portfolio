'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  applyThemePreference,
  runThemeTransition,
  subscribeThemeStorage,
} from '@/lib/themeTransition';
import { navigateWithCirclePortal } from '@/lib/portalTransition';
import {
  parseArtAboutConfig,
  type ArtAboutExperienceItem,
} from '@/lib/artAbout';

export type ArtAboutExperience = ArtAboutExperienceItem;

export default function ArtAboutView({
  initialSettings,
  initialExperiences = [],
}: {
  initialSettings?: Record<string, string>;
  initialExperiences?: ArtAboutExperience[];
}) {
  const router = useRouter();
  const { settings } = useSiteSettings(initialSettings);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const aboutConfig = parseArtAboutConfig(
    settings.art_about_config,
    settings,
    initialExperiences
  );
  const experiences = aboutConfig.experiences;

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

  const emailAddress =
    aboutConfig.email || settings.email_address || 'adrianbahri87@gmail.com';
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  const isDark = theme === 'dark';
  const palette = isDark
    ? {
        bg: '#0B0B0B',
        border: '#272727',
        ink: '#F2EFE9',
        inkSoft: '#BDB9B0',
        inkMuted: '#8F8B83',
        accent: '#EA6A12',
      }
    : {
        bg: '#F2EFE9',
        border: '#D0CBBF',
        ink: '#141413',
        inkSoft: '#3A3732',
        inkMuted: '#5A564E',
        accent: '#D95B08',
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
      {/* Ultra-Thin Swiss Midpoint Utility Bar (28px, Matches /art) */}
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
            <span
              className="hidden sm:inline underline underline-offset-[2px]"
              style={{ color: palette.ink }}
            >
              ABOUT
            </span>
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
                className="transition-opacity hover:underline hover:underline-offset-[2px]"
                style={{ color: palette.inkMuted }}
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

      {/* Production 2-Column Swiss ABOUT Page */}
      <main
        id="main-content"
        className="w-full px-5 pb-20 pt-20 font-sans text-[12px] uppercase leading-[16.5px] tracking-[-0.12px] sm:px-8 lg:px-10"
      >
        <div className="mb-10 sm:hidden">
          <Link
            href="/art"
            className="inline-flex items-center gap-1.5 font-mono text-[11px]"
            style={{ color: palette.inkMuted }}
          >
            <ArrowLeft size={11} aria-hidden="true" />
            <span>BACK TO ARCHIVE</span>
          </Link>
        </div>

        {/* 1. WHO AM I */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-0">
          <div
            className="md:pr-[111px] md:text-right"
            style={{ color: palette.inkMuted }}
          >
            WHO AM I
          </div>
          <div className="max-w-[475px] space-y-4">
            <p className="whitespace-pre-line">{aboutConfig.bioPrimary}</p>
            {aboutConfig.bioSecondary && (
              <p
                className="whitespace-pre-line"
                style={{ color: palette.inkSoft }}
              >
                {aboutConfig.bioSecondary}
              </p>
            )}
          </div>
        </div>

        {/* 2. WORK EXPERIENCE (Synced with Database) */}
        <div
          className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
          style={{ borderTop: `1px solid ${palette.border}` }}
        >
          <div
            className="md:pr-[111px] md:text-right"
            style={{ color: palette.inkMuted }}
          >
            WORK EXPERIENCE
          </div>
          <div className="max-w-[475px] space-y-7">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className="font-semibold"
                    style={{ color: palette.ink }}
                  >
                    {exp.company}
                    {exp.role ? ` | ${exp.role}` : ''}
                  </span>
                  {exp.period && (
                    <span style={{ color: palette.inkMuted }}>
                      {exp.period}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p style={{ color: palette.inkSoft }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. SKILLS */}
        <div
          className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
          style={{ borderTop: `1px solid ${palette.border}` }}
        >
          <div
            className="md:pr-[111px] md:text-right"
            style={{ color: palette.inkMuted }}
          >
            SKILLS
          </div>
          <div className="max-w-[475px] space-y-6">
            <div className="space-y-1">
              {aboutConfig.skills.map((skill, idx) => (
                <p key={`skill-${idx}`}>{skill}</p>
              ))}
            </div>
            {aboutConfig.tools.length > 0 && (
              <div className="space-y-1" style={{ color: palette.inkMuted }}>
                {aboutConfig.tools.map((tool, idx) => (
                  <p key={`tool-${idx}`}>{tool}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. CONNECT */}
        <div
          className="mt-[48px] grid grid-cols-1 gap-3 pt-[40px] md:mt-[64px] md:grid-cols-2 md:gap-0 md:pt-[52px]"
          style={{ borderTop: `1px solid ${palette.border}` }}
        >
          <div
            className="md:pr-[111px] md:text-right"
            style={{ color: palette.inkMuted }}
          >
            CONNECT
          </div>
          <div className="max-w-[475px] space-y-1.5">
            <div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="cursor-pointer underline-offset-[2px] hover:underline"
                style={{
                  color: copiedEmail ? palette.accent : palette.ink,
                }}
              >
                {copiedEmail ? 'COPIED TO CLIPBOARD' : emailAddress}
              </button>{' '}
              <span style={{ color: palette.inkMuted }}>| MAIL</span>
            </div>
            {aboutConfig.links.map((item) => (
              <div key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-[2px] hover:underline"
                >
                  {item.label}
                </a>{' '}
                <span style={{ color: palette.inkMuted }}>
                  | {item.platform}
                </span>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={(e) => navigateWithCirclePortal('/', router, e)}
                className="cursor-pointer underline-offset-[2px] hover:underline"
              >
                ENGINEERING PORTFOLIO
              </button>{' '}
              <span style={{ color: palette.inkMuted }}>| DEV MODE</span>
            </div>
          </div>
        </div>

        {/* Minimal Swiss Footer */}
        <footer
          className="mt-24 flex flex-wrap items-center justify-between gap-3 border-t pt-5 font-sans text-[12px] uppercase tracking-[-0.34px]"
          style={{
            borderColor: palette.border,
            color: palette.inkMuted,
          }}
        >
          <span>© {new Date().getFullYear()} ADRIAN (DRI4N)</span>
          <span>{aboutConfig.footerLocation}</span>
        </footer>
      </main>
    </div>
  );
}
