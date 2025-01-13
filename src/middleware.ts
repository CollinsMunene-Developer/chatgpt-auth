import { createServerClient, CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  const requestUrl = request.nextUrl.clone()
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            request,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name)
          response = NextResponse.next({
            request,
          })
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = requestUrl.pathname

  // Handle auth routes
  if (path.startsWith('/auth/')) {
    // Allow access to verification page
    if (path === '/auth/verify-email') {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      return response
    }

    // Redirect verified users away from login/signup
    if (user && user.email_confirmed_at && (path === '/auth/login' || path === '/auth/signup')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Allow access to other auth pages
    return response
  }

  // Protect all other routes
  if (!user) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect_to', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Require email verification for protected routes
  if (!user.email_confirmed_at && !path.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/auth/verify-email', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}