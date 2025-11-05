'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { createSwapRequest } from '@/lib/actions';
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

export function SwapRequestModal({ theirSlot, mySwappableSlots }: { theirSlot: Event, mySwappableSlots: Event[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRequestSwap = () => {
    if (!selectedSlotId) {
      toast({
        variant: 'destructive',
        title: 'No slot selected',
        description: 'Please select one of your slots to offer.',
      });
      return;
    }
    
    startTransition(async () => {
      const result = await createSwapRequest(selectedSlotId, theirSlot.id);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
        setIsOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const hasSlotsToOffer = mySwappableSlots.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Request Swap
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Swap</DialogTitle>
          <DialogDescription>
            {hasSlotsToOffer ? "Select one of your swappable slots to offer in exchange." : "You have no swappable slots to offer."}
          </DialogDescription>
        </DialogHeader>
        {hasSlotsToOffer && (
            <>
                <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 text-center border-r pr-2">
                        <p className="text-sm font-semibold">Their Slot</p>
                        <p className="text-xs">{theirSlot.title}</p>
                        <p className="text-xs text-muted-foreground">{format(theirSlot.startTime, 'MMM d, p')}</p>
                    </div>
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-center pl-2">
                        <p className="text-sm font-semibold">Your Offer</p>
                        <p className="text-xs">{selectedSlotId ? mySwappableSlots.find(s=>s.id === selectedSlotId)?.title : '...'}</p>
                        <p className="text-xs text-muted-foreground">{selectedSlotId ? format(mySwappableSlots.find(s=>s.id === selectedSlotId)!.startTime, 'MMM d, p') : '...'}</p>
                    </div>
                </div>

                <Separator />
                
                <ScrollArea className="max-h-64">
                    <RadioGroup value={selectedSlotId} onValueChange={setSelectedSlotId} className="p-1">
                        <div className="space-y-2">
                            {mySwappableSlots.map((slot) => (
                            <Label key={slot.id} htmlFor={slot.id} className="flex items-center gap-4 rounded-md border p-3 hover:bg-accent hover:text-accent-foreground has-[input:checked]:border-primary">
                                <RadioGroupItem value={slot.id} id={slot.id} />
                                <div>
                                    <p className="font-semibold">{slot.title}</p>
                                    <p className="text-sm text-muted-foreground">{format(slot.startTime, 'EEEE, MMM d @ p')}</p>
                                </div>
                            </Label>
                            ))}
                        </div>
                    </RadioGroup>
                </ScrollArea>
            </>
        )}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          {hasSlotsToOffer && (
            <Button onClick={handleRequestSwap} disabled={!selectedSlotId || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
