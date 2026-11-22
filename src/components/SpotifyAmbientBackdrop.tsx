'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useSpotifyLive } from '@/lib/spotifyStore';

/**
 * Full-page minimalist ambient blurred album-art wash.
 * - Defers loading during the first-visit AgentBuilderIntro so the intro stays 120fps.
 * - Fades in gradually (1.5s) ONLY after the image has completely finished downloading.
 */
export default function SpotifyAmbientBackdrop() {
  const { data } = useSpotifyLive();
  const albumUrl = data?.configured ? data.albumImageUrl : null;
  const isPlaying = Boolean(data?.isPlaying);

  const [canMountImage, setCanMountImage] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Wait for first-visit AgentBuilderIntro to complete before loading the ambient backdrop
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    let timer: number | null = null;

    const scheduleEnable = (delayMs: number) => {
      timer = window.setTimeout(() => setCanMountImage(true), delayMs);
    };

    if (html.getAttribute('data-agent-building') !== 'true') {
      scheduleEnable(520);
      return () => {
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    const observer = new MutationObserver(() => {
      if (html.getAttribute('data-agent-building') !== 'true') {
        observer.disconnect();
        scheduleEnable(320);
      }
    });
    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-agent-building'],
    });

    return () => {
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  // Handle already-cached images cleanly
  useEffect(() => {
    if (!canMountImage || !albumUrl) return;
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoadedUrl(albumUrl);
    }
  }, [canMountImage, albumUrl]);

  if (!canMountImage || !albumUrl) return null;

  const isReady = loadedUrl === albumUrl;

  return (
    <div
      aria-hidden="true"
      className="dev-page-ambient pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={albumUrl}
        src={albumUrl}
        alt=""
        decoding="async"
        fetchPriority="low"
        onLoad={() => setLoadedUrl(albumUrl)}
        data-ready={isReady ? 'true' : 'false'}
        data-playing={isPlaying ? 'true' : 'false'}
        className="dev-page-ambient-img h-full w-full scale-125 object-cover"
      />
    </div>
  );
}

/**
 * Minimalist footer credit attributing the ambient blurred page background
 * to the currently playing (or last played) Spotify track.
 */
export function SpotifyFooterCredit() {
  const { data } = useSpotifyLive();

  if (!data?.configured || !data.title) return null;

  const isPlaying = Boolean(data.isPlaying);
  const trackLabel = data.artist
    ? `${data.title} — ${data.artist}`
    : data.title;

  return (
    <div
      className="mt-3 flex items-center gap-2 border-t pt-3 text-[11.5px] leading-[18px]"
      style={{
        borderColor: 'var(--art-hairline)',
        color: 'var(--art-ink-muted)',
      }}
    >
      {isPlaying ? (
        <span
          aria-hidden="true"
          className="inline-flex h-2.5 shrink-0 items-end gap-[2px]"
        >
          <span className="dev-eq-bar h-full w-[2px] rounded-full bg-[#1DB954]" />
          <span className="dev-eq-bar dev-eq-bar-2 h-full w-[2px] rounded-full bg-[#1DB954]" />
          <span className="dev-eq-bar dev-eq-bar-3 h-full w-[2px] rounded-full bg-[#1DB954]" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: 'var(--art-ink-muted)' }}
        />
      )}

      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]">
        {isPlaying ? 'Background · Now playing' : 'Background · Last played'}
      </span>

      <a
        href={data.songUrl || 'https://open.spotify.com'}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor-label="listen"
        className="group inline-flex min-w-0 items-center gap-1 transition-colors cursor-pointer"
        style={{ color: 'var(--art-ink)' }}
      >
        <span className="dev-hover-title truncate font-medium">
          {trackLabel}
        </span>
        <ArrowUpRight
          size={11}
          aria-hidden="true"
          className="shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
        />
      </a>
    </div>
  );
}
