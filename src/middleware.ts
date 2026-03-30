import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/daftar')

  const isPublicPage = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/berita') ||
    request.nextUrl.pathname.startsWith('/kategori') ||
    request.nextUrl.pathname.startsWith('/pencarian') ||
    request.nextUrl.pathname.startsWith('/artikel')
  
  // /admin membutuhkan login tapi role-check dilakukan di halaman itu sendiri
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  
  const isManajemenPage = request.nextUrl.pathname.startsWith('/sekretariat-manajemen')
  const isManajemenLogin = request.nextUrl.pathname === '/sekretariat-manajemen/login'

  // Aturan Pengalihan Standar: Pengguna tidak login yang mencoba akses halaman NON-publik akan dilempar ke /login
  if (!user && !isAuthPage && !isPublicPage && !isManajemenPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Khusus Manajemen
  if (!user && isManajemenPage && !isManajemenLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/sekretariat-manajemen/login'
    return NextResponse.redirect(url)
  }

  // Jika mencoba akses /dasbor tapi belum login
  if (!user && request.nextUrl.pathname.startsWith('/dasbor')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }


  // Logged in user hitting standard Auth pages redirects to Dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dasbor'
    return NextResponse.redirect(url)
  }

  // Logged in user hitting Manajemen Login redirects to Manajemen Dashboard
  if (user && isManajemenLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/sekretariat-manajemen'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
