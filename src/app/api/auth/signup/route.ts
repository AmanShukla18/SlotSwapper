import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let name: string | undefined;
    let email: string | undefined;
    let password: string | undefined;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name;
      email = body.email;
      password = body.password;
    } else {
      const form = await req.formData();
      const n = form.get('name');
      const e = form.get('email');
      const p = form.get('password');
      if (n) name = String(n);
      if (e) email = String(e);
      if (p) password = String(p);
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate JWT token
    const token = await generateToken(user._id.toString());

    // If request was a form POST, redirect to accept route which will set cookie
    if (!contentType.includes('application/json')) {
      const acceptUrl = new URL('/api/auth/accept', req.url);
      acceptUrl.searchParams.set('token', token);
      acceptUrl.searchParams.set('next', '/dashboard');
      const response = NextResponse.redirect(acceptUrl, { status: 303 });
      return response;
    }

    const response = NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl
        },
        message: 'Account created successfully'
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}