'use client';

import { format, formatDistanceToNow } from "date-fns";
import type { Event, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SwapRequestModal } from "./swap-request-modal";

interface MarketplaceEvent extends Event {
  user: User;
}

function SlotCard({ event, mySwappableEvents }: { event: MarketplaceEvent, mySwappableEvents: Event[] }) {
    const userInitials = event.user.name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>{format(event.startTime, 'EEEE, MMMM d, yyyy')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-semibold">{format(event.startTime, 'p')} - {format(event.endTime, 'p')}</p>
        <p className="text-sm text-muted-foreground">{formatDistanceToNow(event.startTime, { addSuffix: true })}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={event.user.avatarUrl} alt={event.user.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{event.user.name}</span>
        </div>
        <SwapRequestModal theirSlot={event} mySwappableSlots={mySwappableEvents} />
      </CardFooter>
    </Card>
  );
}

export function SwappableSlotsList({ marketplaceEvents, mySwappableEvents }: { marketplaceEvents: MarketplaceEvent[], mySwappableEvents: Event[] }) {

    if (marketplaceEvents.length === 0) {
        return (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">Marketplace is Empty</h3>
            <p className="text-muted-foreground mt-1">No one has made any slots swappable yet. Check back later!</p>
          </div>
        )
      }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketplaceEvents.map((event) => (
        <SlotCard key={event.id} event={event} mySwappableEvents={mySwappableEvents} />
      ))}
    </div>
  );
}
