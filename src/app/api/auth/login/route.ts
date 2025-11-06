import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user';
import { generateToken } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ✅ Generate JWT token
    const token = await generateToken(user._id.toString());

    // ✅ Construct clean response
    const response = new NextResponse(
      JSON.stringify({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        message: 'Login successful',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );

    // ✅ Set cookie (optimized for localhost dev)
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: false,          // must be false for localhost
      sameSite: 'none',       // allows cookie to be sent right after POST
      domain: 'localhost',    // ensures visibility to middleware
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[LOGIN ERROR]:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
