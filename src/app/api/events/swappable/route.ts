import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';

// GET /api/events/swappable - Get all swappable events from other users
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

    const events = await Event.find({
      owner: { $ne: user._id },
      status: 'SWAPPABLE'
    })
    .populate('owner', 'name avatarUrl')
    .sort({ startTime: 1 });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Get swappable events error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}