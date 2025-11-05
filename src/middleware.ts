import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isAppPath = pathname.startsWith('/dashboard') || pathname.startsWith('/marketplace') || pathname.startsWith('/requests');

  const token = request.cookies.get('auth_token')?.value;
  const decoded = token ? await verifyToken(token) : null;
  
  // Redirect to login if trying to access protected pages without valid token
  if (isAppPath && !decoded) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if trying to access auth pages with valid token
  if ((isAuthPath || pathname === '/') && decoded) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login from root if not authenticated
  if (pathname === '/' && !decoded) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*', '/marketplace/:path*', '/requests/:path*'],
}