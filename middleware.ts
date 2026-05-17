import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/login 은 허용
  if (pathname === '/admin/login') return NextResponse.next()

  // /admin/* 전체 보호
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
