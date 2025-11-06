import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateToken } from '@/lib/auth-utils';

function setCookie(response: NextResponse, token: string) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
  };

  response.cookies.set('auth_token', token, cookieOptions);
  return response;
}

function createSuccessResponse(user: any, token: string) {
  const response = NextResponse.json(
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
      message: 'Logged in successfully'
    },
    { status: 200 }
  );

  return setCookie(response, token);
}

function createRedirectResponse(req: NextRequest, token: string) {
  // Redirect to the /api/auth/accept route which will set the cookie on a GET
  const acceptUrl = new URL('/api/auth/accept', req.url);
  acceptUrl.searchParams.set('token', token);
  acceptUrl.searchParams.set('next', '/dashboard');

  const response = NextResponse.redirect(acceptUrl, {
    status: 303,
  });

  // Do NOT set cookie here; /api/auth/accept will set it on the following GET
  return response;
}

export async function POST(req: NextRequest) {
  console.log('[LOGIN] Starting login process');
  try {
    await connectDB();
    console.log('[LOGIN] Connected to database');

    let email: string | undefined;
    let password: string | undefined;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else {
      const form = await req.formData();
      email = String(form.get('email') || '');
      password = String(form.get('password') || '');
    }

    if (!email || !password) {
      console.log('[LOGIN] Missing credentials');
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    console.log('[LOGIN] Finding user:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      console.log('[LOGIN] Invalid credentials for:', email);
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] User authenticated:', user._id);
    const token = await generateToken(user._id.toString());

    // For form submissions (browser POST), redirect with cookie
    if (!contentType.includes('application/json')) {
      console.log('[LOGIN] Form submission - redirecting with cookie');
      const response = createRedirectResponse(req, token);
      console.log('[LOGIN] Response prepared:', {
        type: 'redirect',
        location: '/dashboard',
        cookie: response.cookies.get('auth_token')
      });
      return response;
    }

    // For API calls (fetch), return JSON with cookie
    console.log('[LOGIN] API call - returning JSON with cookie');
    const response = createSuccessResponse(user, token);
    console.log('[LOGIN] Response prepared:', {
      type: 'json',
      cookie: response.cookies.get('auth_token')
    });
    return response;

  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}