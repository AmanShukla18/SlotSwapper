import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    const nextUrl = req.nextUrl.searchParams.get('next') || '/';

    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }

    // Set the auth cookie (same attributes as server login route)
    // Return a small HTML page that performs a client-side navigation.
    // This ensures the browser stores the cookie from the response before navigating.
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Redirecting…</title></head><body><script>try{window.location.replace("${nextUrl}");}catch(e){window.location.href="${nextUrl}";}</script><noscript><meta http-equiv="refresh" content="0;url=${nextUrl}" /></noscript></body></html>`;
    const resp = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    resp.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return resp;
  } catch (err) {
    console.error('Accept token error', err);
    return NextResponse.json({ message: 'Failed to accept token' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let token: string | undefined;
    let nextUrl = '/';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      token = body.token;
      nextUrl = body.next || '/';
    } else {
      const form = await req.formData();
      const t = form.get('token');
      if (t) token = String(t);
      const n = form.get('next');
      if (n) nextUrl = String(n);
    }

    if (!token) {
      return NextResponse.json({ message: 'Missing token' }, { status: 400 });
    }

    // Set cookie then return a small HTML page which navigates the browser
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Redirecting…</title></head><body><script>try{window.location.replace("${nextUrl}");}catch(e){window.location.href="${nextUrl}";}</script><noscript><meta http-equiv="refresh" content="0;url=${nextUrl}" /></noscript></body></html>`;
    const resp = new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
    resp.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return resp;
  } catch (err) {
    console.error('Accept token POST error', err);
    return NextResponse.json({ message: 'Failed to accept token' }, { status: 500 });
  }
}
