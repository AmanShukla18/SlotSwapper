import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/event';
import { validateRequest } from '@/lib/auth-utils';

// GET /api/events/my - Get all events for the current user
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

    const events = await Event.find({ owner: user._id }).sort({ startTime: 1 });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST /api/events/my - Create a new event
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

    const { title, startTime, endTime } = await req.json();

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const event = await Event.create({
      title,
      startTime,
      endTime,
      owner: user._id,
      status: 'BUSY'
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}