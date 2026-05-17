import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * On-demand cache revalidation endpoint.
 * Calling this forces Next.js to purge its static page caches and serve fresh data.
 */
export async function POST(req: NextRequest) {
  try {
    // Purges static page caches for all routes, layouts, and sub-pages under '/'
    revalidatePath('/', 'layout');
    
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: 'All Next.js and CDN caches successfully purged for all routes!'
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to revalidate cache' }, { status: 500 });
  }
}
