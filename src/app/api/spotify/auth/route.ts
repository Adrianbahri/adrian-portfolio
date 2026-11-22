import { NextResponse } from 'next/server';

const REDIRECT_URI = 'http://127.0.0.1:3000/api/spotify/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played user-top-read';

/**
 * Dev-only helper route to start Spotify OAuth and obtain a refresh token.
 * Visit http://127.0.0.1:3000/api/spotify/auth in development after adding
 * SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local.
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Spotify auth helper is only available in development.' },
      { status: 403 }
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error: 'SPOTIFY_CLIENT_ID is missing in .env.local',
        nextStep:
          'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local, restart dev server, then revisit /api/spotify/auth.',
      },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    show_dialog: 'true',
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
