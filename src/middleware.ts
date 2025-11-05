import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { middleware as appMiddleware } from './app/(app)/middleware';
import { middleware as authMiddleware } from './app/(auth)/middleware';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/marketplace') || pathname.startsWith('/requests')) {
    return appMiddleware(request);
  }

  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return authMiddleware(request);
  }
  
  if (pathname === '/') {
      const authToken = request.cookies.get('auth_token')?.value;
      if (authToken) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/dashboard/:path*', '/marketplace/:path*', '/requests/:path*'],
}