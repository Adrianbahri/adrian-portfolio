'use client';

import { useEffect, useState } from 'react';

export interface SpotifyTopTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string | null;
  songUrl: string;
  durationMs: number | null;
}

export interface SpotifyTopArtist {
  id: string;
  name: string;
  genre: string | null;
  imageUrl: string | null;
  artistUrl: string;
}

export interface SpotifyLiveData {
  configured: boolean;
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string | null;
  songUrl?: string;
  progressMs?: number | null;
  durationMs?: number | null;
  playedAt?: string | null;
  fetchedAt?: number;
  topTracks?: SpotifyTopTrack[];
  topArtists?: SpotifyTopArtist[];
  needsTopScope?: boolean;
}

type Listener = (state: { data: SpotifyLiveData | null; loading: boolean }) => void;

const POLL_INTERVAL_MS = 15_000;

let currentData: SpotifyLiveData | null = null;
let isLoading = true;
let inFlight = false;
let lastFetchAt = 0;
let pollTimer: number | null = null;
let initialTimer: number | null = null;
let listenersInitialized = false;
const listeners = new Set<Listener>();

function emit() {
  const snapshot = { data: currentData, loading: isLoading };
  listeners.forEach((listener) => listener(snapshot));
}

async function fetchLatestSpotify() {
  if (inFlight) return;
  inFlight = true;
  lastFetchAt = Date.now();
  try {
    const res = await fetch('/api/spotify', { cache: 'no-store' });
    if (!res.ok) return;
    const json = (await res.json()) as SpotifyLiveData;
    currentData = json;
  } catch {
    // Keep last known track on transient network errors
  } finally {
    inFlight = false;
    isLoading = false;
    emit();
  }
}

function handleVisibilityOrFocus() {
  if (
    document.visibilityState === 'visible' &&
    Date.now() - lastFetchAt > 8_000
  ) {
    fetchLatestSpotify();
  }
}

function startPollingIfNeeded() {
  if (typeof window === 'undefined') return;

  if (!listenersInitialized) {
    listenersInitialized = true;
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
  }

  if (pollTimer === null) {
    if (currentData === null && initialTimer === null) {
      const delayMs =
        typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-agent-building') === 'true'
          ? 1600
          : 250;
      initialTimer = window.setTimeout(() => {
        initialTimer = null;
        fetchLatestSpotify();
      }, delayMs);
    } else if (currentData !== null && Date.now() - lastFetchAt > 8_000) {
      fetchLatestSpotify();
    }
    pollTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLatestSpotify();
      }
    }, POLL_INTERVAL_MS);
  }
}

function stopPollingIfUnused() {
  if (listeners.size > 0) return;

  if (initialTimer !== null) {
    window.clearTimeout(initialTimer);
    initialTimer = null;
  }
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
  if (listenersInitialized && typeof window !== 'undefined') {
    window.removeEventListener('focus', handleVisibilityOrFocus);
    document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    listenersInitialized = false;
  }
}

/**
 * Shared real-time Spotify hook.
 * Deduplicates requests across Backdrop, Cassette Player, and Footer Credit,
 * polls every 5s while visible, and refreshes immediately on window focus.
 */
export function useSpotifyLive() {
  const [state, setState] = useState<{
    data: SpotifyLiveData | null;
    loading: boolean;
  }>(() => ({
    data: currentData,
    loading: isLoading,
  }));

  useEffect(() => {
    const listener: Listener = (next) => setState(next);
    listeners.add(listener);
    startPollingIfNeeded();

    // Sync immediately if cache already exists
    if (!isLoading) {
      setState({ data: currentData, loading: false });
    }

    return () => {
      listeners.delete(listener);
      stopPollingIfUnused();
    };
  }, []);

  return state;
}
