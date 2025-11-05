import { getCurrentUser } from "@/lib/auth-utils";
import { SwappableSlotsList } from "@/components/marketplace/swappable-slots-list";
import connectDB from '@/lib/db';
import Event from '@/lib/models/event';

export default async function MarketplacePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectDB();

  const [marketplaceEventsRaw, mySwappableRaw] = await Promise.all([
  Event.find({ owner: { $ne: user.id }, status: 'SWAPPABLE' }).populate('owner', 'name avatarUrl email').sort({ startTime: 1 }).lean(),
    Event.find({ owner: user.id, status: 'SWAPPABLE' }).sort({ startTime: 1 }).lean(),
  ]);

  const marketplaceEvents = marketplaceEventsRaw.map((e: any) => ({
    id: e._id?.toString?.() || '',
    title: e.title,
    startTime: e.startTime,
    endTime: e.endTime,
    status: e.status,
    // Event type expects userId; MarketplaceEvent expects user as well
    userId: e.owner?._id?.toString?.() || e.owner?.toString?.() || '',
    user: {
      id: e.owner?._id?.toString?.() || e.owner?.toString?.() || '',
      name: e.owner?.name || 'Unknown',
      email: e.owner?.email || '',
      avatarUrl: e.owner?.avatarUrl || '',
    }
  }));

  const mySwappableEvents = mySwappableRaw.map((e: any) => ({
    id: e._id?.toString?.() || '',
    title: e.title,
    startTime: e.startTime,
    endTime: e.endTime,
    status: e.status,
    userId: e.owner?.toString?.() || '',
  }));

  return (
    <div className="container mx-auto max-w-7xl">
       <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Slot Marketplace
        </h1>
        <p className="text-muted-foreground mt-1">
            Browse swappable time slots from other users.
        </p>
      </div>
      <SwappableSlotsList marketplaceEvents={marketplaceEvents} mySwappableEvents={mySwappableEvents} />
    </div>
  );
}
