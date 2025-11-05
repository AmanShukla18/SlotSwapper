import { getCurrentUser } from "@/lib/auth-utils";
import { RequestsTabs } from "@/components/requests/requests-tabs";
import connectDB from '@/lib/db';
import SwapRequest from '@/lib/models/swapRequest';

export default async function RequestsPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    await connectDB();

    // Populate requester/requestee and slot owners so we can build PopulatedSwapRequest
    const incomingRaw = await SwapRequest.find({ requestee: user.id })
      .populate({ path: 'requester', select: 'name avatarUrl' })
      .populate({ path: 'requesterSlot', populate: { path: 'owner', select: 'name avatarUrl' } })
      .populate({ path: 'requestedSlot', populate: { path: 'owner', select: 'name avatarUrl' } })
      .sort('-createdAt')
      .lean();

    const outgoingRaw = await SwapRequest.find({ requester: user.id })
      .populate({ path: 'requestee', select: 'name avatarUrl' })
      .populate({ path: 'requesterSlot', populate: { path: 'owner', select: 'name avatarUrl' } })
      .populate({ path: 'requestedSlot', populate: { path: 'owner', select: 'name avatarUrl' } })
      .sort('-createdAt')
      .lean();

    const incoming = incomingRaw.map((r: any) => ({
      id: r._id?.toString?.() || '',
      status: r.status,
      requester: r.requester ? { id: r.requester._id?.toString?.() || '', name: r.requester.name || '', email: r.requester.email || '', avatarUrl: r.requester.avatarUrl || '' } : { id: '', name: '', email: '', avatarUrl: '' },
      offeredSlot: r.requesterSlot ? {
        id: r.requesterSlot._id?.toString?.() || '',
        title: r.requesterSlot.title,
        startTime: r.requesterSlot.startTime,
        endTime: r.requesterSlot.endTime,
        status: r.requesterSlot.status,
        userId: r.requesterSlot.owner?._id?.toString?.() || r.requesterSlot.owner?.toString?.() || ''
      } : { id: '', title: '', startTime: new Date(), endTime: new Date(), status: 'BUSY', userId: '' },
      requestedSlot: r.requestedSlot ? {
        id: r.requestedSlot._id?.toString?.() || '',
        title: r.requestedSlot.title,
        startTime: r.requestedSlot.startTime,
        endTime: r.requestedSlot.endTime,
        status: r.requestedSlot.status,
        userId: r.requestedSlot.owner?._id?.toString?.() || r.requestedSlot.owner?.toString?.() || ''
      } : { id: '', title: '', startTime: new Date(), endTime: new Date(), status: 'BUSY', userId: '' },
      requestedSlotOwner: r.requestedSlot?.owner ? { id: r.requestedSlot.owner._id?.toString?.() || '', name: r.requestedSlot.owner.name || '', email: r.requestedSlot.owner.email || '', avatarUrl: r.requestedSlot.owner.avatarUrl || '' } : { id: user.id, name: user.name, email: user.email || '', avatarUrl: user.avatarUrl }
    }));

    const outgoing = outgoingRaw.map((r: any) => ({
      id: r._id?.toString?.() || '',
      status: r.status,
      requester: { id: user.id, name: user.name, email: user.email || '', avatarUrl: user.avatarUrl },
      offeredSlot: r.requesterSlot ? {
        id: r.requesterSlot._id?.toString?.() || '',
        title: r.requesterSlot.title,
        startTime: r.requesterSlot.startTime,
        endTime: r.requesterSlot.endTime,
        status: r.requesterSlot.status,
        userId: r.requesterSlot.owner?._id?.toString?.() || r.requesterSlot.owner?.toString?.() || user.id
      } : { id: '', title: '', startTime: new Date(), endTime: new Date(), status: 'BUSY', userId: user.id },
      requestedSlot: r.requestedSlot ? {
        id: r.requestedSlot._id?.toString?.() || '',
        title: r.requestedSlot.title,
        startTime: r.requestedSlot.startTime,
        endTime: r.requestedSlot.endTime,
        status: r.requestedSlot.status,
        userId: r.requestedSlot.owner?._id?.toString?.() || r.requestedSlot.owner?.toString?.() || ''
      } : { id: '', title: '', startTime: new Date(), endTime: new Date(), status: 'BUSY', userId: '' },
      requestedSlotOwner: r.requestee ? { id: r.requestee._id?.toString?.() || '', name: r.requestee.name || '', email: r.requestee.email || '', avatarUrl: r.requestee.avatarUrl || '' } : { id: '', name: '', email: '', avatarUrl: '' }
    }));
    
    return (
        <div className="container mx-auto max-w-4xl">
             <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Swap Requests
                </h1>
                <p className="text-muted-foreground mt-1">
                    Manage your incoming and outgoing slot swap proposals.
                </p>
            </div>
              <RequestsTabs incoming={incoming} outgoing={outgoing} />
        </div>
    );
}
