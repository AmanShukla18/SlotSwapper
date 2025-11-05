export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type EventStatus = 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';

export type Event = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  userId: string;
};

export type SwapRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type SwapRequest = {
  id: string;
  requesterId: string;
  requestedSlotOwnerId: string;
  offeredSlotId: string;
  requestedSlotId: string;
  status: SwapRequestStatus;
};

export type PopulatedSwapRequest = Omit<SwapRequest, 'requesterId' | 'offeredSlotId' | 'requestedSlotId' | 'requestedSlotOwnerId'> & {
  requester: User;
  offeredSlot: Event;
  requestedSlot: Event;
  requestedSlotOwner: User;
}
