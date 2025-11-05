import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SwapRequest from '@/lib/models/swapRequest';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await validateRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { mySlotId, theirSlotId } = await req.json();

    if (!mySlotId || !theirSlotId) {
      return NextResponse.json(
        { message: 'Please provide both slots' },
        { status: 400 }
      );
    }

    // Verify both slots
    const [mySlot, theirSlot] = await Promise.all([
      Event.findOne({ _id: mySlotId, owner: user._id }),
      Event.findOne({ _id: theirSlotId })
    ]);

    if (!mySlot || !theirSlot) {
      return NextResponse.json(
        { message: 'One or both slots not found' },
        { status: 404 }
      );
    }

    // Verify slots are swappable
    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return NextResponse.json(
        { message: 'One or both slots are not available for swapping' },
        { status: 400 }
      );
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requesterSlot: mySlot._id,
      requestedSlot: theirSlot._id,
      requester: user._id,
      requestee: theirSlot.owner
    });

    // Update both slots to pending
    await Promise.all([
      Event.findByIdAndUpdate(mySlot._id, { status: 'SWAP_PENDING' }),
      Event.findByIdAndUpdate(theirSlot._id, { status: 'SWAP_PENDING' })
    ]);

    await swapRequest.populate([
      { path: 'requesterSlot' },
      { path: 'requestedSlot' },
      { path: 'requester', select: 'name avatarUrl' },
      { path: 'requestee', select: 'name avatarUrl' }
    ]);

    return NextResponse.json(swapRequest, { status: 201 });
  } catch (error) {
    console.error('Create swap request error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}