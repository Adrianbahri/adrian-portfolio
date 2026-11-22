'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Disc3, UserRound } from 'lucide-react';
import { useSpotifyLive } from '@/lib/spotifyStore';

function formatRelativePlayedAt(iso?: string | null): string | null {
  if (!iso) return null;
  const timestamp = Date.parse(iso);
  if (Number.isNaN(timestamp)) return null;

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(ms?: number | null): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function CassetteReel({
  spinning,
  tapeFill = 0.7,
}: {
  spinning: boolean;
  tapeFill?: number;
}) {
  const clamped = Math.min(1, Math.max(0.12, tapeFill));
  const outerSize = Math.round(34 + clamped * 14);

  return (
    <div className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center">
      {/* Wound magnetic tape pack */}
      <span
        aria-hidden="true"
        className="dev-cassette-coil absolute rounded-full transition-[width,height] duration-700"
        style={{
          width: `${outerSize}px`,
          height: `${outerSize}px`,
        }}
      />

      {/* Precision 6-tooth rotating cassette hub */}
      <svg
        viewBox="0 0 36 36"
        width="30"
        height="30"
        aria-hidden="true"
        data-spinning={spinning ? 'true' : 'false'}
        className="dev-cassette-reel relative z-10"
      >
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="var(--art-paper-raised)"
          stroke="var(--art-hairline-strong)"
          strokeWidth="1.2"
        />
        <circle
          cx="18"
          cy="18"
          r="10.2"
          fill="var(--art-tile)"
          stroke="var(--art-hairline-strong)"
          strokeWidth="1"
        />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="16.9"
            y="8.4"
            width="2.2"
            height="3.8"
            rx="0.6"
            fill="var(--art-ink)"
            fillOpacity="0.72"
            transform={`rotate(${deg} 18 18)`}
          />
        ))}
        <circle
          cx="18"
          cy="18"
          r="4.2"
          fill="var(--art-ground)"
          fillOpacity="0.65"
        />
        <circle
          cx="18"
          cy="6.2"
          r="1.4"
          fill={spinning ? '#1DB954' : 'var(--art-ink-muted)'}
        />
      </svg>
    </div>
  );
}

function CornerScrew({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 flex h-[6px] w-[6px] items-center justify-center rounded-full opacity-55 ${className}`}
      style={{
        backgroundColor: 'var(--art-hairline-strong)',
        boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.45)',
      }}
    >
      <span className="h-[1px] w-[4px] rotate-45 bg-black/40" />
    </span>
  );
}

export default function SpotifyNowPlaying() {
  const { data, loading } = useSpotifyLive();
  const [imgError, setImgError] = useState(false);
  const [topTab, setTopTab] = useState<'tracks' | 'artists'>('tracks');
  const [liveProgressMs, setLiveProgressMs] = useState<number>(0);

  useEffect(() => {
    setImgError(false);
  }, [data?.albumImageUrl]);

  // Smoothly tick playback progress every 1s while playing
  useEffect(() => {
    const baseProgress =
      typeof data?.progressMs === 'number' ? data.progressMs : 0;
    const duration =
      typeof data?.durationMs === 'number' ? data.durationMs : 0;

    if (!data?.isPlaying || !duration) {
      setLiveProgressMs(baseProgress);
      return;
    }

    const syncedAt = data.fetchedAt || Date.now();
    const computeNow = () => {
      const elapsed = Math.max(0, Date.now() - syncedAt);
      return Math.min(duration, baseProgress + elapsed);
    };

    setLiveProgressMs(computeNow());
    const tick = window.setInterval(() => {
      setLiveProgressMs(computeNow());
    }, 1000);

    return () => window.clearInterval(tick);
  }, [data?.isPlaying, data?.progressMs, data?.durationMs, data?.fetchedAt]);

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading Spotify cassette and top monthly charts"
        className="grid grid-cols-1 gap-3.5 md:grid-cols-[316px_1fr]"
      >
        <div
          className="h-[246px] rounded-[16px] p-3"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        >
          <div
            className="h-full rounded-[10px] opacity-40"
            style={{ backgroundColor: 'var(--art-paper-raised)' }}
          />
        </div>
        <div
          className="h-[246px] rounded-[16px] p-3.5"
          style={{
            backgroundColor: 'var(--art-tile)',
            border: '1px solid var(--art-line)',
          }}
        />
      </div>
    );
  }

  const isPlaying = Boolean(data?.isPlaying);
  const hasTrack = Boolean(data?.configured && data?.title);
  const relativeTime = formatRelativePlayedAt(data?.playedAt);
  const href = hasTrack ? data?.songUrl || 'https://open.spotify.com' : undefined;

  const durationMs = typeof data?.durationMs === 'number' ? data.durationMs : 0;
  const progressRatio =
    durationMs > 0 ? Math.min(1, Math.max(0, liveProgressMs / durationMs)) : 0;

  const topTracks = data?.topTracks ?? [];
  const topArtists = data?.topArtists ?? [];
  const needsTopScope = Boolean(data?.needsTopScope);

  const cassetteShell = (
    <div
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-[16px] p-3 transition-all duration-300 group-hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--art-tile)',
        border: '1px solid var(--art-hairline-strong)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.06), 0 14px 32px -22px rgba(0,0,0,0.65)',
      }}
    >
      {/* Subtle, Controlled Blurred Album Ambient Backdrop */}
      {hasTrack && data?.albumImageUrl && !imgError && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.albumImageUrl}
            alt=""
            data-playing={isPlaying ? 'true' : 'false'}
            className={`dev-cassette-ambient-img h-full w-full scale-150 object-cover blur-3xl saturate-125 ${
              isPlaying ? '' : 'grayscale-[55%]'
            }`}
          />
          <div className="dev-cassette-scrim absolute inset-0" />
        </div>
      )}

      {/* 4 Machined Corner Screws */}
      <CornerScrew className="left-2 top-2" />
      <CornerScrew className="right-2 top-2" />
      <CornerScrew className="bottom-2 left-2" />
      <CornerScrew className="bottom-2 right-2" />

      {/* Printed Minimalist Cassette Label */}
      <div
        className="dev-cassette-label-scrim relative z-10 rounded-[10px] p-3"
        style={{
          border: '1px solid var(--art-hairline)',
        }}
      >
        {/* Top Metadata Strip */}
        <div
          className="flex items-center justify-between gap-2 border-b pb-2 font-mono text-[9.5px] uppercase tracking-[0.14em]"
          style={{ borderColor: 'var(--art-hairline)' }}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {isPlaying ? (
              <>
                <span
                  aria-hidden="true"
                  className="inline-flex h-2.5 items-end gap-[2px]"
                >
                  <span className="dev-eq-bar h-full w-[2px] rounded-full bg-[#1DB954]" />
                  <span className="dev-eq-bar dev-eq-bar-2 h-full w-[2px] rounded-full bg-[#1DB954]" />
                  <span className="dev-eq-bar dev-eq-bar-3 h-full w-[2px] rounded-full bg-[#1DB954]" />
                </span>
                <span className="truncate font-semibold text-[#1DB954]">
                  PLAYING
                </span>
              </>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--art-ink-muted)' }}
                />
                <span
                  className="truncate"
                  style={{ color: 'var(--art-ink-muted)' }}
                >
                  {hasTrack
                    ? `STOPPED${relativeTime ? ` · ${relativeTime}` : ''}`
                    : 'TAPE IDLE'}
                </span>
              </>
            )}
          </span>

          <span
            className="inline-flex shrink-0 items-center gap-1"
            style={{ color: 'var(--art-ink-muted)' }}
          >
            <span>A · 60</span>
            {hasTrack && (
              <ArrowUpRight
                size={11}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            )}
          </span>
        </div>

        {/* Album Cover + Track Title + Artist + Album */}
        <div className="mt-2.5 flex items-center gap-3">
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[7px]"
            style={{
              backgroundColor: 'var(--art-tile)',
              border: '1px solid var(--art-hairline-strong)',
              boxShadow: '0 4px 12px -4px rgba(0,0,0,0.45)',
            }}
          >
            {hasTrack && data?.albumImageUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.albumImageUrl}
                alt={
                  data.album
                    ? `${data.album} album cover`
                    : `${data.title} cover`
                }
                width={44}
                height={44}
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                <Disc3 size={18} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="dev-hover-title truncate text-[13.5px] font-semibold leading-snug"
              style={{ color: 'var(--art-ink)' }}
            >
              {hasTrack ? data?.title : 'Not playing right now'}
            </p>
            <p
              className="truncate text-[11.5px] leading-snug"
              style={{ color: 'var(--art-ink-soft)' }}
            >
              {hasTrack
                ? data?.artist
                : data?.configured === false
                ? 'Connect Spotify API'
                : 'No recent tracks'}
            </p>
            {hasTrack && data?.album && (
              <p
                className="mt-0.5 truncate font-mono text-[9.5px]"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                {data.album}
              </p>
            )}
          </div>
        </div>

        {/* Authentic Translucent Recessed Cassette Window */}
        <div className="dev-cassette-window relative mt-3 flex h-[60px] items-center justify-between overflow-hidden rounded-[8px] px-3.5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          {/* Left spool unwinds as progress increases */}
          <CassetteReel
            spinning={isPlaying}
            tapeFill={durationMs > 0 ? 1 - progressRatio : 0.78}
          />

          {/* Center transparent tape gauge window */}
          <div className="dev-cassette-bridge relative mx-2.5 flex h-[28px] flex-1 flex-col items-center justify-center overflow-hidden rounded-[4px] px-2">
            <div
              aria-hidden="true"
              className="mb-1 flex w-full items-end justify-between opacity-45"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <span
                  key={n}
                  className={`w-[1px] ${n === 4 ? 'h-[6px]' : 'h-[3.5px]'}`}
                  style={{ backgroundColor: 'var(--art-ink-muted)' }}
                />
              ))}
            </div>
            <div
              className="h-[1.5px] w-full rounded-full"
              style={{
                background: isPlaying
                  ? 'linear-gradient(90deg, rgba(29,185,84,0.2) 0%, #1DB954 50%, rgba(29,185,84,0.2) 100%)'
                  : 'var(--art-hairline-strong)',
              }}
            />
          </div>

          {/* Right spool fills up as progress increases */}
          <CassetteReel
            spinning={isPlaying}
            tapeFill={durationMs > 0 ? progressRatio : 0.28}
          />
        </div>

        {/* Live Playback Progress Bar & Timestamps (01:42 / 04:05) */}
        {hasTrack && durationMs > 0 && (
          <div className="mt-2.5 space-y-1">
            <div
              className="h-[3px] w-full overflow-hidden rounded-full"
              style={{ backgroundColor: 'var(--art-hairline)' }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-linear"
                style={{
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: isPlaying
                    ? '#1DB954'
                    : 'var(--art-ink-muted)',
                }}
              />
            </div>
            <div
              className="flex items-center justify-between font-mono text-[9.5px] tabular-nums"
              style={{ color: 'var(--art-ink-muted)' }}
            >
              <span>{formatDuration(liveProgressMs)}</span>
              <span>{formatDuration(durationMs)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Classic Trapezoid Bottom Cassette Head Lip */}
      <div className="relative z-10 mt-2.5 flex items-center justify-center">
        <div
          className="flex w-[76%] items-center justify-between rounded-t-[6px] px-4 py-1 font-mono text-[8.5px] uppercase tracking-[0.16em]"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--art-paper-raised) 70%, transparent)',
            borderTop: '1px solid var(--art-hairline)',
            borderLeft: '1px solid var(--art-hairline)',
            borderRight: '1px solid var(--art-hairline)',
          }}
        >
          <span
            aria-hidden="true"
            className="h-[5px] w-[5px] rounded-full border"
            style={{ borderColor: 'var(--art-hairline-strong)' }}
          />
          <span style={{ color: 'var(--art-ink-muted)' }}>
            SPOTIFY TAPE{hasTrack ? ' ↗' : ''}
          </span>
          <span
            aria-hidden="true"
            className="h-[5px] w-[5px] rounded-full border"
            style={{ borderColor: 'var(--art-hairline-strong)' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[316px_1fr]">
      {/* Left: Authentic Proportioned Cassette Tape Player */}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor-label="listen"
          aria-label={`${isPlaying ? 'Now playing' : 'Last played'} on Spotify: ${data?.title} by ${data?.artist}${data?.album ? ` from ${data.album}` : ''}`}
          className="group block cursor-pointer rounded-[16px]"
        >
          {cassetteShell}
        </a>
      ) : (
        <div className="group block">{cassetteShell}</div>
      )}

      {/* Right: Top Tracks / Top Artists This Month */}
      <div
        className="flex flex-col justify-between rounded-[16px] p-3.5"
        style={{
          backgroundColor: 'var(--art-tile)',
          border: '1px solid var(--art-line)',
        }}
      >
        <div className="flex items-center justify-between gap-2 pb-2.5">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: 'var(--art-ink-muted)' }}
          >
            TOP THIS MONTH
          </span>

          {/* Segmented Toggle: Tracks | Artists */}
          <div
            role="tablist"
            aria-label="Top Spotify category"
            className="inline-flex rounded-[7px] p-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]"
            style={{
              backgroundColor: 'var(--art-paper)',
              border: '1px solid var(--art-hairline)',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={topTab === 'tracks'}
              onClick={() => setTopTab('tracks')}
              className="cursor-pointer rounded-[5px] px-2 py-0.5 transition-colors"
              style={{
                backgroundColor:
                  topTab === 'tracks' ? 'var(--art-paper-raised)' : 'transparent',
                color:
                  topTab === 'tracks'
                    ? 'var(--art-ink)'
                    : 'var(--art-ink-muted)',
              }}
            >
              Tracks
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={topTab === 'artists'}
              onClick={() => setTopTab('artists')}
              className="cursor-pointer rounded-[5px] px-2 py-0.5 transition-colors"
              style={{
                backgroundColor:
                  topTab === 'artists' ? 'var(--art-paper-raised)' : 'transparent',
                color:
                  topTab === 'artists'
                    ? 'var(--art-ink)'
                    : 'var(--art-ink-muted)',
              }}
            >
              Artists
            </button>
          </div>
        </div>

        {needsTopScope ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <p
              className="font-mono text-[10.5px] uppercase tracking-[0.1em]"
              style={{ color: 'var(--art-marker-text)' }}
            >
              SCOPE REQUIRED: user-top-read
            </p>
            <p
              className="max-w-[260px] text-[12px] leading-relaxed"
              style={{ color: 'var(--art-ink-soft)' }}
            >
              Re-authorize once at{' '}
              <code className="font-mono text-[11px]">/api/spotify/auth</code>{' '}
              to unlock Top Tracks &amp; Top Artists.
            </p>
          </div>
        ) : topTab === 'tracks' ? (
          topTracks.length > 0 ? (
            <ul
              className="divide-y"
              style={{ borderColor: 'var(--art-hairline)' }}
            >
              {topTracks.map((track, idx) => (
                <li
                  key={track.id}
                  style={{ borderColor: 'var(--art-hairline)' }}
                >
                  <a
                    href={track.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-label="play"
                    className="group flex items-center gap-2.5 py-2 transition-colors cursor-pointer"
                  >
                    <span
                      className="w-4 shrink-0 font-mono text-[9.5px] tabular-nums"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      0{idx + 1}
                    </span>

                    <div
                      className="h-8 w-8 shrink-0 overflow-hidden rounded-[5px]"
                      style={{
                        backgroundColor: 'var(--art-paper-raised)',
                        border: '1px solid var(--art-line)',
                      }}
                    >
                      {track.albumImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.albumImageUrl}
                          alt={`${track.album} cover`}
                          width={32}
                          height={32}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ color: 'var(--art-ink-muted)' }}
                        >
                          <Disc3 size={13} aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="dev-hover-title truncate text-[12.5px] font-medium leading-tight"
                        style={{ color: 'var(--art-ink)' }}
                      >
                        {track.title}
                      </p>
                      <p
                        className="truncate text-[11px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {track.artist}
                      </p>
                    </div>

                    <span
                      className="shrink-0 font-mono text-[9.5px] tabular-nums"
                      style={{ color: 'var(--art-ink-muted)' }}
                    >
                      {track.durationMs ? formatDuration(track.durationMs) : '↗'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 items-center justify-center py-8 text-center">
              <p
                className="font-mono text-[11px]"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                No top tracks data yet for this month.
              </p>
            </div>
          )
        ) : topArtists.length > 0 ? (
          <ul
            className="divide-y"
            style={{ borderColor: 'var(--art-hairline)' }}
          >
            {topArtists.map((artist, idx) => (
              <li
                key={artist.id}
                style={{ borderColor: 'var(--art-hairline)' }}
              >
                <a
                  href={artist.artistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor-label="artist"
                  className="group flex items-center gap-2.5 py-2 transition-colors cursor-pointer"
                >
                  <span
                    className="w-4 shrink-0 font-mono text-[9.5px] tabular-nums"
                    style={{ color: 'var(--art-ink-muted)' }}
                  >
                    0{idx + 1}
                  </span>

                  <div
                    className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
                    style={{
                      backgroundColor: 'var(--art-paper-raised)',
                      border: '1px solid var(--art-line)',
                    }}
                  >
                    {artist.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        <UserRound size={13} aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="dev-hover-title truncate text-[12.5px] font-medium leading-tight"
                      style={{ color: 'var(--art-ink)' }}
                    >
                      {artist.name}
                    </p>
                    {artist.genre && (
                      <p
                        className="truncate font-mono text-[10px] capitalize"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {artist.genre}
                      </p>
                    )}
                  </div>

                  <ArrowUpRight
                    size={12}
                    aria-hidden="true"
                    className="shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    style={{ color: 'var(--art-ink-muted)' }}
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center py-8 text-center">
            <p
              className="font-mono text-[11px]"
              style={{ color: 'var(--art-ink-muted)' }}
            >
              No top artists data yet for this month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
