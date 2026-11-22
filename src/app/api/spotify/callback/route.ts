import { NextRequest, NextResponse } from 'next/server';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const REDIRECT_URI = 'http://127.0.0.1:3000/api/spotify/callback';

/**
 * Dev-only callback route that exchanges the Spotify authorization code
 * for a refresh token to paste into .env.local as SPOTIFY_REFRESH_TOKEN.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Spotify callback helper is only available in development.' },
      { status: 403 }
    );
  }

  const code = request.nextUrl.searchParams.get('code');
  const authError = request.nextUrl.searchParams.get('error');

  if (authError) {
    return NextResponse.json(
      { error: `Spotify authorization denied: ${authError}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing ?code parameter from Spotify.' },
      { status: 400 }
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing in .env.local.' },
      { status: 400 }
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  const data = (await tokenRes.json()) as {
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !data.refresh_token) {
    return NextResponse.json(
      {
        error: data.error || 'Failed to exchange authorization code.',
        description: data.error_description,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: 'Copy SPOTIFY_REFRESH_TOKEN into your .env.local (and Vercel env vars), then restart your dev server.',
    SPOTIFY_REFRESH_TOKEN: data.refresh_token,
  });
}
