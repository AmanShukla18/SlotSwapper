import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Wait briefly to allow cookie to be registered in dev
  await new Promise((res) => setTimeout(res, 300));
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
