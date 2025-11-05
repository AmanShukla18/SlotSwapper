import { getCurrentUser } from "@/lib/auth";
import { getMyEvents } from "@/lib/placeholder-data";
import { EventList } from "@/components/dashboard/event-list";
import { CreateEventDialog } from "@/components/dashboard/create-event-dialog";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const events = await getMyEvents(user.id);

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
