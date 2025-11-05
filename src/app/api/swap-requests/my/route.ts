import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SwapRequest from '@/lib/models/swapRequest';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await validateRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const incoming = await SwapRequest.find({
      requestee: user._id,
      status: 'PENDING'
    })
    .populate([
      { path: 'requesterSlot' },
      { path: 'requestedSlot' },
      { path: 'requester', select: 'name avatarUrl' }
    ])
    .sort('-createdAt');

    const outgoing = await SwapRequest.find({
      requester: user._id
    })
    .populate([
      { path: 'requesterSlot' },
      { path: 'requestedSlot' },
      { path: 'requestee', select: 'name avatarUrl' }
    ])
    .sort('-createdAt');

    return NextResponse.json({ incoming, outgoing });
  } catch (error) {
    console.error('Get swap requests error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}