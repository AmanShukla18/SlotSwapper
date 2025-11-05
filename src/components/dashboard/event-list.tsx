'use client';

import { useTransition } from 'react';
import { format, formatRelative, isToday, isTomorrow } from 'date-fns';
import { Event, EventStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateEventStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, Ban, Clock, Loader2 } from 'lucide-react';

function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge
      variant={
        status === 'SWAPPABLE'
          ? 'secondary'
          : status === 'SWAP_PENDING'
          ? 'outline'
          : 'default'
      }
      className={cn({
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': status === 'SWAPPABLE',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': status === 'SWAP_PENDING',
        'border-gray-300': status === 'SWAP_PENDING'
      })}
    >
      {status.replace('_', ' ')}
    </Badge>
  );
}

function EventCard({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleStatusChange = (status: EventStatus) => {
    startTransition(async () => {
      const result = await updateEventStatus(event.id, status);
      if (result.success) {
        toast({ title: "Status Updated", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.message });
      }
    });
  };

  const ActionButton = () => {
    switch (event.status) {
      case 'BUSY':
        return (
          <Button size="sm" variant="outline" onClick={() => handleStatusChange('SWAPPABLE')} disabled={isPending}>
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Make Swappable
          </Button>
        );
      case 'SWAPPABLE':
        return (
          <Button size="sm" variant="ghost" onClick={() => handleStatusChange('BUSY')} disabled={isPending}>
            <Ban className="mr-2 h-4 w-4" /> Make Busy
          </Button>
        );
      case 'SWAP_PENDING':
        return <p className="text-sm text-muted-foreground">A swap is pending for this slot.</p>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{event.title}</CardTitle>
        <EventStatusBadge status={event.status} />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <Clock className="mr-2 inline h-4 w-4" />
          {format(event.startTime, 'p')} - {format(event.endTime, 'p')}
        </div>
        <div className="relative">
          {isPending && <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
          <div className={cn({ 'opacity-50': isPending })}><ActionButton /></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventList({ initialEvents }: { initialEvents: Event[] }) {
  const groupedEvents = initialEvents.reduce((acc, event) => {
    const dateKey = format(event.startTime, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const sortedGroupKeys = Object.keys(groupedEvents).sort();
  
  const formatDateHeading = (dateKey: string) => {
    const date = new Date(dateKey + 'T00:00:00'); // Ensure correct date parsing
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatRelative(date, new Date()).split(' at')[0];
  }

  if (initialEvents.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">No events yet</h3>
        <p className="text-muted-foreground mt-1">Create your first event to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedGroupKeys.map((dateKey) => (
        <div key={dateKey}>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            {formatDateHeading(dateKey)}
            <span className="ml-2 text-base font-normal text-muted-foreground">{format(new Date(dateKey+'T00:00:00'), 'EEEE, MMMM d')}</span>
          </h2>
          <div className="space-y-4">
            {groupedEvents[dateKey].map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
