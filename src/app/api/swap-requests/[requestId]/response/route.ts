import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SwapRequest from '@/lib/models/swapRequest';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, { params }: { params: { requestId: string }}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const user = await validateRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId } = params;
    const { accept } = await req.json();

    const swapRequest = await SwapRequest.findOne({
      _id: requestId,
      requestee: user._id,
      status: 'PENDING'
    }).session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: 'Swap request not found' },
        { status: 404 }
      );
    }

    const [requesterSlot, requestedSlot] = await Promise.all([
      Event.findById(swapRequest.requesterSlot).session(session),
      Event.findById(swapRequest.requestedSlot).session(session)
    ]);

    if (!requesterSlot || !requestedSlot) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: 'One or both slots not found' },
        { status: 404 }
      );
    }

    if (accept) {
      // Swap owners
      const tempOwner = requesterSlot.owner;
      requesterSlot.owner = requestedSlot.owner;
      requestedSlot.owner = tempOwner;

      // Update status
      requesterSlot.status = 'BUSY';
      requestedSlot.status = 'BUSY';
      swapRequest.status = 'ACCEPTED';

      await Promise.all([
        requesterSlot.save({ session }),
        requestedSlot.save({ session }),
        swapRequest.save({ session })
      ]);
    } else {
      // Reject the swap request
      requesterSlot.status = 'SWAPPABLE';
      requestedSlot.status = 'SWAPPABLE';
      swapRequest.status = 'REJECTED';

      await Promise.all([
        requesterSlot.save({ session }),
        requestedSlot.save({ session }),
        swapRequest.save({ session })
      ]);
    }

    await session.commitTransaction();
    
    return NextResponse.json({
      message: `Swap request ${accept ? 'accepted' : 'rejected'} successfully`
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Respond to swap request error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}