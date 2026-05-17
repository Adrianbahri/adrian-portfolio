import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: any }
) {
  try {
    // Safely await params to support Next.js 15/16 and older versions
    const params = await context.params;
    const pathArray = params.path;

    if (!pathArray || pathArray.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const fullPath = pathArray.join('/');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return new Response('Supabase URL not configured', { status: 500 });
    }

    // Construct the direct public CDN URL of the Supabase object
    const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/portfolio-assets/${fullPath}`;

    // Fetch the asset from Supabase Storage
    const response = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        // Safe standard header forwarding
        'Accept': 'image/*,video/*,application/*'
      },
      next: {
        revalidate: 31536000 // Cache in Next.js/Vercel data cache for 1 year
      }
    });

    if (!response.ok) {
      return new Response('Asset Not Found', { status: 404 });
    }

    // Retrieve headers
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentLength = response.headers.get('Content-Length');
    const blob = await response.blob();

    // Return the file with customized high-performance headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    
    // Leverage Vercel CDN & Client-side browser caching (Cached for 1 Year!)
    headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');

    return new Response(blob, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error('Asset Proxy Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
