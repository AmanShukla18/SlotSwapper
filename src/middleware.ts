import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-utils';

// ✅ Define public and protected routes
const PUBLIC_PATHS = ['/', '/login', '/signup'];
const PROTECTED_PATHS = ['/dashboard', '/marketplace', '/requests'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚫 Skip API, static, and asset requests
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('auth_token')?.value;

  console.log('[MIDDLEWARE]', {
    path: pathname,
    tokenPresent: !!token,
    tokenSnippet: token ? token.slice(0, 10) + '...' : null,
  });

  // 🚪 PUBLIC ROUTES — login, signup, etc.
  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (decoded?.id) {
          console.log('[MIDDLEWARE] User already logged in → redirecting to /dashboard');
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      } catch (err: any) {
        console.warn('[MIDDLEWARE] Invalid token on public route:', err.message);
        const res = NextResponse.next();
        res.cookies.delete('auth_token');
        return res;
      }
    }

    console.log('[MIDDLEWARE] No token → staying on public route');
    return NextResponse.next();
  }

  // 🔒 PROTECTED ROUTES — require valid token
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!token) {
      console.log('[MIDDLEWARE] Missing token → redirect to /login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const decoded = await verifyToken(token);

      if (!decoded?.id) {
        console.warn('[MIDDLEWARE] Invalid decoded token → redirect to /login');
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.delete('auth_token');
        return res;
      }

      // ✅ Valid token — allow access
      console.log('[MIDDLEWARE] Valid token → allowing access to protected route');
      return NextResponse.next();
    } catch (err: any) {
      console.error('[MIDDLEWARE] Token verification error:', err.message);
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('auth_token');
      return res;
    }
  }

  // 🌐 All other routes — allow
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
