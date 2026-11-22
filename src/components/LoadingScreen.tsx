'use client';

import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import '@/styles/shahriyar.css';

export default function LoadingScreen({
  delayMs = 240,
}: {
  delayMs?: number;
}) {
  const { settings } = useSiteSettings();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [cachedGif, setCachedGif] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  useEffect(() => {
    try {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
      const localGif = localStorage.getItem('dri4n_loading_gif') || '';
      if (localGif) setCachedGif(localGif);
    } catch {
      // ignore storage errors
    }
  }, []);

  const loadingGif = (settings.loading_gif || cachedGif || '').trim();

  useEffect(() => {
    if (settings.loading_gif) {
      try {
        localStorage.setItem('dri4n_loading_gif', settings.loading_gif);
      } catch {
        // ignore storage errors
      }
    }
    setImgError(false);
  }, [settings.loading_gif]);

  if (!visible) return null;

  return (
    <div
      data-dev-theme={theme}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="dev-shell dev-blueprint-grid fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center px-6 animate-[devFadeIn_220ms_ease_both]"
    >
      <div
        className="relative flex w-full max-w-[260px] flex-col items-center rounded-[18px] p-6 text-center backdrop-blur-md"
        style={{
          backgroundColor: 'var(--art-tile)',
          border: '1px solid var(--art-line)',
          boxShadow: '0 20px 50px -28px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Corner Registration Ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-2.5 h-2 w-2 border-l border-t opacity-45"
          style={{ borderColor: 'var(--art-ink-muted)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-2.5 h-2 w-2 border-r border-t opacity-45"
          style={{ borderColor: 'var(--art-ink-muted)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l opacity-45"
          style={{ borderColor: 'var(--art-ink-muted)' }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 right-2.5 h-2 w-2 border-b border-r opacity-45"
          style={{ borderColor: 'var(--art-ink-muted)' }}
        />

        {/* Custom Loading GIF Slot (falls back to clean editorial mock animation) */}
        <div
          className="relative flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-[14px]"
          style={{
            backgroundColor: 'var(--art-paper-raised)',
            border: '1px solid var(--art-hairline-strong)',
          }}
        >
          {loadingGif && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loadingGif}
              alt="Loading animation"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-dashed opacity-50 dev-cassette-reel"
                  data-spinning="true"
                  style={{ borderColor: 'var(--art-marker)' }}
                />
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-[3px] dev-live-pulse"
                  style={{ backgroundColor: 'var(--art-marker)' }}
                />
              </div>
              <span
                className="font-mono text-[8.5px] uppercase tracking-[0.16em]"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                GIF SLOT
              </span>
            </div>
          )}
        </div>

        {/* Minimal Editorial Loading Meta */}
        <div className="mt-5 w-full space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
            <span style={{ color: 'var(--art-ink)' }}>DRI4N</span>
            <span style={{ color: 'var(--art-marker-text)' }}>LOADING</span>
          </div>

          <div
            className="relative h-[2px] w-full overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--art-hairline)' }}
          >
            <span
              aria-hidden="true"
              className="dev-loading-bar absolute inset-y-0 left-0 w-1/2 rounded-full"
              style={{ backgroundColor: 'var(--art-marker)' }}
            />
          </div>

          <p
            className="font-mono text-[9.5px] tracking-[0.06em]"
            style={{ color: 'var(--art-ink-muted)' }}
          >
            Preparing workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
