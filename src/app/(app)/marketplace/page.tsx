import { getCurrentUser } from "@/lib/auth";
import { getMarketplaceEvents, getMySwappableEvents } from "@/lib/placeholder-data";
import { SwappableSlotsList } from "@/components/marketplace/swappable-slots-list";

export default async function MarketplacePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [marketplaceEvents, mySwappableEvents] = await Promise.all([
      getMarketplaceEvents(user.id),
      getMySwappableEvents(user.id),
  ]);

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
