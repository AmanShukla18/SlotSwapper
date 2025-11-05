import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';

export async function PUT(req: NextRequest, { params }: { params: { eventId: string }}) {
  try {
    await connectDB();
    const user = await validateRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { eventId } = params;
    const { status } = await req.json();

    if (!['BUSY', 'SWAPPABLE'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    const event = await Event.findOne({
      _id: eventId,
      owner: user._id
    });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status === 'SWAP_PENDING') {
      return NextResponse.json(
        { message: 'Cannot update status of a pending swap' },
        { status: 400 }
      );
    }

    event.status = status;
    await event.save();

    return NextResponse.json(event);
  } catch (error) {
    console.error('Update event status error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}