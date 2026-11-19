import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isMaintenanceMode, shouldBypassMaintenance } from '@/lib/maintenance'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Serve the Under Maintenance experience for all public routes
  if (isMaintenanceMode && !shouldBypassMaintenance(pathname)) {
    const maintenanceUrl = new URL('/maintenance', request.url)
    const rewriteResponse = NextResponse.rewrite(maintenanceUrl, {
      status: 503,
    })
    rewriteResponse.headers.set('Retry-After', '3600')
    rewriteResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    return rewriteResponse
  }

  // Only run Supabase auth checks for /admin and /login
  const isProtectedRoute = pathname.startsWith('/admin') || pathname === '/login'
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/admin')) {
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

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect /login to /admin if already logged in
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|opengraph-image).*)',
  ],
}
