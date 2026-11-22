import { NextResponse } from 'next/server';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT =
  'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';
const TOP_TRACKS_ENDPOINT =
  'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5';
const TOP_ARTISTS_ENDPOINT =
  'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5';

interface SpotifyArtistRef {
  name: string;
}

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

interface SpotifyTrack {
  id?: string;
  name: string;
  duration_ms?: number;
  artists: SpotifyArtistRef[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifyFullArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

interface CachedTrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string | null;
  songUrl: string;
  durationMs: number | null;
}

interface CachedArtistItem {
  id: string;
  name: string;
  genre: string | null;
  imageUrl: string | null;
  artistUrl: string;
}

// Server-side in-memory caches to prevent Spotify 429 rate-limiting across 10s frontend polls
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

let cachedLastTrack: {
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string | null;
  songUrl: string;
  durationMs: number | null;
  progressMs: number | null;
  playedAt: string | null;
} = {
  title: 'Ramai Sepi Bersama',
  artist: 'Hindia',
  album: 'Ramai Sepi Bersama',
  albumImageUrl:
    'https://i.scdn.co/image/ab67616d00001e026ba49c3c7079830dd9a2c8b3',
  songUrl: 'https://open.spotify.com/track/1VTjpFsZhnKvEgZhlzPIzb',
  durationMs: 188000,
  progressMs: 131933,
  playedAt: null,
};

let cachedTopTracks: CachedTrackItem[] = [
  {
    id: '1E7zLPDdqo0OvzVmGj5aoV',
    title: 'Ada titik-titik di ujung doa',
    artist: 'Sal Priadi',
    album: 'MARKERS AND SUCH PENS FLASHDISKS',
    albumImageUrl:
      'https://i.scdn.co/image/ab67616d00001e02686acaaa87bfc6ebb42b3bd2',
    songUrl: 'https://open.spotify.com/track/1E7zLPDdqo0OvzVmGj5aoV',
    durationMs: 305357,
  },
  {
    id: '1VTjpFsZhnKvEgZhlzPIzb',
    title: 'Ramai Sepi Bersama',
    artist: 'Hindia',
    album: 'Ramai Sepi Bersama',
    albumImageUrl:
      'https://i.scdn.co/image/ab67616d00001e026ba49c3c7079830dd9a2c8b3',
    songUrl: 'https://open.spotify.com/track/1VTjpFsZhnKvEgZhlzPIzb',
    durationMs: 188000,
  },
  {
    id: '4DrJqdZgPBHoMNVG5iOLlG',
    title: 'Bersenja Gurau',
    artist: 'Raim Laode',
    album: "iqro'",
    albumImageUrl:
      'https://i.scdn.co/image/ab67616d00001e02a9d1f9b5d3275b0625e13e79',
    songUrl: 'https://open.spotify.com/track/4DrJqdZgPBHoMNVG5iOLlG',
    durationMs: 194293,
  },
  {
    id: '0wULafSHeHYZFu54R9ZFRJ',
    title: 'Mangu',
    artist: 'Fourtwnty, Charita Utami',
    album: 'Mangu',
    albumImageUrl:
      'https://i.scdn.co/image/ab67616d00001e02fecb2b49d97ed68528fbf44a',
    songUrl: 'https://open.spotify.com/track/0wULafSHeHYZFu54R9ZFRJ',
    durationMs: 262469,
  },
  {
    id: '48BWWtyjFE2le9sIqJitoL',
    title: 'Rahasia Hati',
    artist: 'Nidji',
    album: '5 cm (Original Motion Picture Soundtrack)',
    albumImageUrl:
      'https://i.scdn.co/image/ab67616d00001e023d4e60ab546528ace91c22fb',
    songUrl: 'https://open.spotify.com/track/48BWWtyjFE2le9sIqJitoL',
    durationMs: 250682,
  },
];

let cachedTopArtists: CachedArtistItem[] = [
  {
    id: '51kyrUsAVqUBcoDEMFkX12',
    name: 'Hindia',
    genre: 'Indonesian Indie',
    imageUrl:
      'https://i.scdn.co/image/ab67616d00001e026ba49c3c7079830dd9a2c8b3',
    artistUrl: 'https://open.spotify.com/artist/51kyrUsAVqUBcoDEMFkX12',
  },
  {
    id: '1NjxFrpEGZTV2Ny0OJxeWu',
    name: 'Sal Priadi',
    genre: 'Indonesian Indie',
    imageUrl:
      'https://i.scdn.co/image/ab67616100005174c8be343422f882f309e2508e',
    artistUrl: 'https://open.spotify.com/artist/1NjxFrpEGZTV2Ny0OJxeWu',
  },
  {
    id: '5LcNPa8f8bRmZqELgoRFkN',
    name: 'Raim Laode',
    genre: 'Indonesian Pop',
    imageUrl:
      'https://i.scdn.co/image/ab67616100005174f0835eb9adc7cee5169194d0',
    artistUrl: 'https://open.spotify.com/artist/5LcNPa8f8bRmZqELgoRFkN',
  },
  {
    id: '0NbKRRBuiIUwS9irPvi7wD',
    name: 'Perunggu',
    genre: 'Indonesian Rock',
    imageUrl:
      'https://i.scdn.co/image/ab67616100005174aacf892228a322f1415e168f',
    artistUrl: 'https://open.spotify.com/artist/0NbKRRBuiIUwS9irPvi7wD',
  },
  {
    id: '1v1khTmozNfxB2ET1Ep288',
    name: 'Last Child',
    genre: 'Indonesian Pop Rock',
    imageUrl:
      'https://i.scdn.co/image/ab67616100005174afe8d291d9d89a395f2badd6',
    artistUrl: 'https://open.spotify.com/artist/1v1khTmozNfxB2ET1Ep288',
  },
];

// Defer /v1/me/top/* and /recently-played background refreshes so they never stall /currently-playing
let topEndpointsNextAttemptAt = Date.now() + 2 * 60 * 60 * 1000;
let recentEndpointNextAttemptAt = Date.now() + 2 * 60 * 60 * 1000;

async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) {
    return cachedAccessToken;
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (data.access_token) {
    cachedAccessToken = data.access_token;
    // Cache token for 50 minutes (tokens last 3600s)
    tokenExpiresAt = now + ((data.expires_in || 3600) - 600) * 1000;
  }
  return cachedAccessToken;
}

async function refreshTopListsIfDue(authHeaders: HeadersInit) {
  const now = Date.now();
  if (now < topEndpointsNextAttemptAt) return;

  // Refresh at most once every 30 minutes
  topEndpointsNextAttemptAt = now + 30 * 60 * 1000;

  try {
    const [topTracksRes, topArtistsRes] = await Promise.allSettled([
      fetch(TOP_TRACKS_ENDPOINT, {
        headers: authHeaders,
        cache: 'no-store',
        signal: AbortSignal.timeout(2200),
      }),
      fetch(TOP_ARTISTS_ENDPOINT, {
        headers: authHeaders,
        cache: 'no-store',
        signal: AbortSignal.timeout(2200),
      }),
    ]);

    if (topTracksRes.status === 'fulfilled') {
      const res = topTracksRes.value;
      if (res.status === 429) {
        topEndpointsNextAttemptAt = now + 60 * 60 * 1000;
      } else if (res.ok) {
        const data = (await res.json()) as { items?: SpotifyTrack[] };
        if (data.items && data.items.length > 0) {
          cachedTopTracks = data.items.slice(0, 5).map((t, idx) => ({
            id: t.id || `top-track-${idx}`,
            title: t.name,
            artist: t.artists.map((a) => a.name).join(', '),
            album: t.album.name,
            albumImageUrl:
              t.album.images[1]?.url || t.album.images[0]?.url || null,
            songUrl: t.external_urls.spotify,
            durationMs:
              typeof t.duration_ms === 'number' ? t.duration_ms : null,
          }));
        }
      }
    }

    if (topArtistsRes.status === 'fulfilled') {
      const res = topArtistsRes.value;
      if (res.status === 429) {
        topEndpointsNextAttemptAt = now + 60 * 60 * 1000;
      } else if (res.ok) {
        const data = (await res.json()) as { items?: SpotifyFullArtist[] };
        if (data.items && data.items.length > 0) {
          cachedTopArtists = data.items.slice(0, 5).map((a) => ({
            id: a.id,
            name: a.name,
            genre: a.genres?.[0] || 'Indonesian Indie',
            imageUrl: a.images?.[1]?.url || a.images?.[0]?.url || null,
            artistUrl: a.external_urls.spotify,
          }));
        }
      }
    }
  } catch {
    // Keep cached top tracks and artists
  }
}

export async function GET() {
  const cacheHeaders = {
    'Cache-Control': 'no-store, max-age=0',
  };

  if (
    !process.env.SPOTIFY_CLIENT_ID ||
    !process.env.SPOTIFY_CLIENT_SECRET ||
    !process.env.SPOTIFY_REFRESH_TOKEN
  ) {
    return NextResponse.json(
      {
        configured: false,
        isPlaying: false,
        topTracks: cachedTopTracks,
        topArtists: cachedTopArtists,
        needsTopScope: false,
      },
      { status: 200, headers: cacheHeaders }
    );
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        {
          configured: true,
          isPlaying: false,
          ...cachedLastTrack,
          fetchedAt: Date.now(),
          topTracks: cachedTopTracks,
          topArtists: cachedTopArtists,
          needsTopScope: false,
        },
        { status: 200, headers: cacheHeaders }
      );
    }

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    // Trigger non-blocking top lists refresh if due (never blocks currently-playing)
    void refreshTopListsIfDue(authHeaders);

    let isPlaying = false;
    let activeTrack: typeof cachedLastTrack | null = null;

    try {
      const nowRes = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: authHeaders,
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      });

      if (nowRes.status === 200) {
        const nowData = (await nowRes.json()) as {
          is_playing?: boolean;
          progress_ms?: number | null;
          currently_playing_type?: string;
          item?: SpotifyTrack | null;
        };

        if (nowData.item) {
          isPlaying = Boolean(nowData.is_playing);
          const durationMs =
            typeof nowData.item.duration_ms === 'number'
              ? nowData.item.duration_ms
              : null;
          const progressMs =
            typeof nowData.progress_ms === 'number'
              ? nowData.progress_ms
              : durationMs;

          activeTrack = {
            title: nowData.item.name,
            artist: nowData.item.artists.map((a) => a.name).join(', '),
            album: nowData.item.album.name,
            albumImageUrl:
              nowData.item.album.images[1]?.url ||
              nowData.item.album.images[0]?.url ||
              null,
            songUrl: nowData.item.external_urls.spotify,
            durationMs,
            progressMs,
            playedAt: null,
          };
          cachedLastTrack = activeTrack;
        }
      }
    } catch {
      // Fall back to cachedLastTrack on timeout
    }

    // Only attempt recently-played if currently-playing had no item and cooldown allows
    if (!activeTrack && Date.now() >= recentEndpointNextAttemptAt) {
      recentEndpointNextAttemptAt = Date.now() + 5 * 60 * 1000;
      try {
        const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
          headers: authHeaders,
          cache: 'no-store',
          signal: AbortSignal.timeout(2200),
        });
        if (recentRes.status === 429) {
          recentEndpointNextAttemptAt = Date.now() + 60 * 60 * 1000;
        } else if (recentRes.ok) {
          const recentData = (await recentRes.json()) as {
            items?: Array<{ track?: SpotifyTrack; played_at?: string }>;
          };
          const latest = recentData.items?.[0];
          if (latest?.track) {
            const durationMs =
              typeof latest.track.duration_ms === 'number'
                ? latest.track.duration_ms
                : null;
            activeTrack = {
              title: latest.track.name,
              artist: latest.track.artists.map((a) => a.name).join(', '),
              album: latest.track.album.name,
              albumImageUrl:
                latest.track.album.images[1]?.url ||
                latest.track.album.images[0]?.url ||
                null,
              songUrl: latest.track.external_urls.spotify,
              durationMs,
              progressMs: durationMs,
              playedAt: latest.played_at ?? null,
            };
            cachedLastTrack = activeTrack;
          }
        }
      } catch {
        // Keep cachedLastTrack
      }
    }

    const finalTrack = activeTrack || cachedLastTrack;

    return NextResponse.json(
      {
        configured: true,
        isPlaying,
        title: finalTrack.title,
        artist: finalTrack.artist,
        album: finalTrack.album,
        albumImageUrl: finalTrack.albumImageUrl,
        songUrl: finalTrack.songUrl,
        progressMs: finalTrack.progressMs,
        durationMs: finalTrack.durationMs,
        playedAt: finalTrack.playedAt,
        fetchedAt: Date.now(),
        topTracks: cachedTopTracks,
        topArtists: cachedTopArtists,
        needsTopScope: false,
      },
      { status: 200, headers: cacheHeaders }
    );
  } catch (error) {
    console.error('Spotify API route error:', error);
    return NextResponse.json(
      {
        configured: true,
        isPlaying: false,
        ...cachedLastTrack,
        fetchedAt: Date.now(),
        topTracks: cachedTopTracks,
        topArtists: cachedTopArtists,
        needsTopScope: false,
      },
      { status: 200, headers: cacheHeaders }
    );
  }
}
