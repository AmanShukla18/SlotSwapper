import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-utils';

// Helper to skip middleware for non-page requests
const shouldSkip = (pathname: string) =>
  pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.includes('.');

// Protected app routes
const isProtected = (pathname: string) =>
  pathname.startsWith('/dashboard') || pathname.startsWith('/marketplace') || pathname.startsWith('/requests');

// Auth pages
const isAuth = (pathname: string) => pathname === '/login' || pathname === '/signup';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  try {
    // Skip non-page requests
    if (shouldSkip(pathname)) return NextResponse.next();

    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      try {
        const decoded = await verifyToken(token);
        // If token is valid, prevent access to auth pages
        if (decoded && decoded.id && isAuth(pathname)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // If token is valid and user is accessing protected routes, allow
        if (decoded && decoded.id) return NextResponse.next();
      } catch (err: any) {
        // Invalid token — clear cookie and redirect to login
        const res = NextResponse.redirect(new URL('/login', request.url));
        res.cookies.delete('auth_token');
        return res;
      }
    }

    // No valid token
    if (isProtected(pathname) || pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow public or auth pages
    return NextResponse.next();
  } catch (err) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('auth_token');
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\.ico).*)'],
};