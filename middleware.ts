import { NextResponse } from 'next/server'

import { auth } from '@/auth'

const publicPaths = ['/login']

function getAuthenticatedRedirect(role: string | undefined, mustChangePassword?: boolean) {
  if (role === 'student' && mustChangePassword) {
    return '/student/change-password'
  }

  switch (role) {
    case 'admin':
      return '/admin'
    case 'trainer':
      return '/trainer'
    case 'student':
      return '/student'
    default:
      return '/login'
  }
}

export default auth((req) => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const session = req.auth
  const isAuthenticated = Boolean(session?.user)
  const userRole = session?.user?.role
  const mustChangePassword = session?.user?.mustChangePassword ?? false

  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(getAuthenticatedRedirect(userRole, mustChangePassword), nextUrl))
    }

    return NextResponse.next()
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(getAuthenticatedRedirect(userRole, mustChangePassword), nextUrl))
    }

    return NextResponse.next()
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', `${pathname}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL(getAuthenticatedRedirect(userRole, mustChangePassword), nextUrl))
  }

  if (pathname.startsWith('/trainer') && userRole !== 'trainer') {
    return NextResponse.redirect(new URL(getAuthenticatedRedirect(userRole, mustChangePassword), nextUrl))
  }

  if (userRole === 'student' && mustChangePassword && pathname !== '/student/change-password') {
    return NextResponse.redirect(new URL('/student/change-password', nextUrl))
  }

  if (pathname.startsWith('/student') && userRole !== 'student') {
    return NextResponse.redirect(new URL(getAuthenticatedRedirect(userRole, mustChangePassword), nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
