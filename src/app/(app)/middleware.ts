import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/marketplace') || pathname.startsWith('/requests');

  if (isAppPage && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/marketplace/:path*', '/requests/:path*'],
}