import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Logged out successfully' }, {
    status: 200,
    headers: {
      'Set-Cookie': 'auth_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
    }
  });
}