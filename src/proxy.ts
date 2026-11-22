import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isMaintenanceModeForHost, shouldBypassMaintenance } from '@/lib/maintenance'
import { ART_SITE_URL, PRIMARY_DOMAIN, isArtHost, normalizeHost } from '@/lib/sites'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')
  const normalizedHost = normalizeHost(host)
  const artSite = isArtHost(host)

  // 1. Maintenance Mode check (supports independent toggles for dri4n.com and art.dri4n.com)
  if (isMaintenanceModeForHost(host) && !shouldBypassMaintenance(pathname)) {
    const maintenanceUrl = new URL('/maintenance', request.url)
    const rewriteResponse = NextResponse.rewrite(maintenanceUrl, {
      status: 503,
    })
    rewriteResponse.headers.set('Retry-After', '3600')
    rewriteResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    return rewriteResponse
  }

  // 2. Consolidate Art / Creative routes onto dri4n.com/art (redirect legacy art.dri4n.com & /creative)
  if (artSite) {
    return NextResponse.redirect(new URL(ART_SITE_URL))
  }

  if (pathname === '/creative' || pathname.startsWith('/creative/')) {
    return NextResponse.redirect(new URL('/art', request.url))
  }

  // 3. Only run Supabase auth checks for /setting and /login
  const isProtectedRoute = pathname.startsWith('/setting') || pathname === '/login'
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/setting')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect /setting routes
  if (pathname.startsWith('/setting')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect /login to /setting if already logged in
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/setting', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|opengraph-image).*)',
  ],
}
