'use client';

import { useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PopulatedSwapRequest } from "@/lib/types";
import { Card, CardContent, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { format } from 'date-fns';
import { ArrowRightLeft, Check, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { respondToSwapRequest } from '@/lib/actions';
import { Badge } from '../ui/badge';

function RequestCard({ request, type }: { request: PopulatedSwapRequest, type: 'incoming' | 'outgoing' }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleResponse = (accept: boolean) => {
        startTransition(async () => {
            const result = await respondToSwapRequest(request.id, accept);
            if(result.success) {
                toast({ title: "Success", description: result.message });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    }

    const requesterInitials = request.requester.name.split(' ').map(n => n[0]).join('');
    const ownerInitials = request.requestedSlotOwner.name.split(' ').map(n => n[0]).join('');

    const offeredBy = type === 'incoming' ? request.requester : request.requestedSlotOwner;
    const offeredByInitials = type === 'incoming' ? requesterInitials : ownerInitials;
    
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* From */}
                    <div className="flex-1 w-full text-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                           <Avatar className="h-6 w-6">
                                <AvatarImage src={offeredBy.avatarUrl} />
                                <AvatarFallback>{offeredByInitials}</AvatarFallback>
                           </Avatar>
                           <p className="font-semibold text-sm">{offeredBy.name} offers:</p>
                        </div>
                        <p className="text-sm font-medium">{request.offeredSlot.title}</p>
                        <p className="text-xs text-muted-foreground">{format(request.offeredSlot.startTime, 'MMM d, p')}</p>
                    </div>

                    <ArrowRightLeft className="h-6 w-6 text-muted-foreground shrink-0" />
                    
                    {/* To */}
                    <div className="flex-1 w-full text-center p-3 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-sm mb-2">For your slot:</p>
                        <p className="text-sm font-medium">{request.requestedSlot.title}</p>
                        <p className="text-xs text-muted-foreground">{format(request.requestedSlot.startTime, 'MMM d, p')}</p>
                    </div>
                </div>
            </CardContent>
            {type === 'incoming' && (
                 <CardFooter className="flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-3">
                    <Button size="sm" variant="outline" onClick={() => handleResponse(false)} disabled={isPending}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" onClick={() => handleResponse(true)} disabled={isPending}>
                        <Check className="mr-2 h-4 w-4" /> Accept
                    </Button>
                    {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </CardFooter>
            )}
             {type === 'outgoing' && (
                 <CardFooter className="flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-3">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Pending approval
                    </Badge>
                </CardFooter>
            )}
        </Card>
    );
}

function EmptyState({ type }: { type: 'incoming' | 'outgoing' }) {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">No {type} requests</h3>
            <p className="text-muted-foreground mt-1">
                {type === 'incoming' ? "You have no pending swap requests from others." : "You haven't sent any swap requests yet."}
            </p>
        </div>
    )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }

export function RequestsTabs({ incoming, outgoing }: { incoming: PopulatedSwapRequest[], outgoing: PopulatedSwapRequest[] }) {
    return (
        <Tabs defaultValue="incoming">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incoming">
                    Incoming
                    <Badge variant="secondary" className="ml-2">{incoming.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="outgoing">
                    Outgoing
                    <Badge variant="secondary" className="ml-2">{outgoing.length}</Badge>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="incoming">
                {incoming.length > 0 ? (
                    <div className="space-y-4 pt-4">
                        {incoming.map(req => <RequestCard key={req.id} request={req} type="incoming" />)}
                    </div>
                ) : <EmptyState type="incoming" />}
            </TabsContent>
            <TabsContent value="outgoing">
                {outgoing.length > 0 ? (
                     <div className="space-y-4 pt-4">
                        {outgoing.map(req => <RequestCard key={req.id} request={req} type="outgoing" />)}
                    </div>
                ) : <EmptyState type="outgoing" />}
            </TabsContent>
        </Tabs>
    );
}
