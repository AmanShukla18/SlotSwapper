import { getCurrentUser } from '@/lib/auth-utils';
import connectDB from '@/lib/db';
import Event from '@/lib/models/event';
import { EventList } from '@/components/dashboard/event-list';
import { CreateEventDialog } from '@/components/dashboard/create-event-dialog';
import type { Event as EventType } from '@/lib/types';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectDB();
  const eventsRaw = await Event.find({ owner: user.id }).sort({ startTime: 1 }).lean();

  const events = eventsRaw.map((e: any) => ({
    id: e._id?.toString?.() || '',
    title: e.title,
    startTime: e.startTime,
    endTime: e.endTime,
    status: e.status,
    userId: e.owner?.toString?.() || e.owner,
  })) as EventType[];
  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Your Schedule
        </h1>
        <CreateEventDialog />
      </div>
      <EventList initialEvents={events} />
    </div>
  );
}
