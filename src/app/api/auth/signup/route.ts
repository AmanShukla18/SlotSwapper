import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateToken } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const user = await User.create({ name, email, password });
    const token = await generateToken(user._id.toString());

    // ✅ Construct manual JSON (avoids hanging under Turbopack)
    const response = new NextResponse(
      JSON.stringify({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        message: 'Account created successfully',
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );

    // ✅ Set cookie (same fix as login)
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: false,          // disable HTTPS for localhost
      sameSite: 'none',       // ensures cookie sent on next redirect
      domain: 'localhost',    // guarantees visibility immediately
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[SIGNUP ERROR]:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
