import type { User, Event, SwapRequest, PopulatedSwapRequest, EventStatus } from './types';
import { addHours, addDays, startOfHour } from 'date-fns';

// In-memory store
let users: User[] = [
  { id: '1', name: 'Alex Doe', email: 'alex@example.com', avatarUrl: 'https://picsum.photos/seed/1/40/40' },
  { id: '2', name: 'Ben Smith', email: 'ben@example.com', avatarUrl: 'https://picsum.photos/seed/2/40/40' },
  { id: '3', name: 'Chloe Brown', email: 'chloe@example.com', avatarUrl: 'https://picsum.photos/seed/3/40/40' },
];

const now = new Date();

let events: Event[] = [
  // User 1's events
  { id: 'e1', title: 'Team Meeting', startTime: startOfHour(addHours(now, 2)), endTime: startOfHour(addHours(now, 3)), status: 'BUSY', userId: '1' },
  { id: 'e2', title: 'Focus Block', startTime: startOfHour(addHours(now, 5)), endTime: startOfHour(addHours(now, 6)), status: 'SWAPPABLE', userId: '1' },
  { id: 'e3', title: '1:1 with Manager', startTime: startOfHour(addDays(now, 1)), endTime: startOfHour(addDays(addHours(now, 1), 1)), status: 'BUSY', userId: '1' },
  { id: 'e4', title: 'Dentist Appointment', startTime: startOfHour(addDays(addHours(now, 4), 1)), endTime: startOfHour(addDays(addHours(now, 5), 1)), status: 'SWAPPABLE', userId: '1' },

  // User 2's events
  { id: 'e5', title: 'Project Brainstorm', startTime: startOfHour(addHours(now, 4)), endTime: startOfHour(addHours(now, 5)), status: 'SWAPPABLE', userId: '2' },
  { id: 'e6', title: 'Code Review', startTime: startOfHour(addDays(now, 2)), endTime: startOfHour(addDays(addHours(now, 2), 2)), status: 'BUSY', userId: '2' },
  { id: 'e7', title: 'All-Hands', startTime: startOfHour(addDays(now, 3)), endTime: startOfHour(addDays(addHours(now, 3), 3)), status: 'SWAPPABLE', userId: '2' },
  
  // User 3's events
  { id: 'e8', title: 'Yoga Class', startTime: startOfHour(addHours(now, 1)), endTime: startOfHour(addHours(now, 2)), status: 'SWAP_PENDING', userId: '3' },
  { id: 'e9', title: 'Design Sync', startTime: startOfHour(addDays(addHours(now, 6), 2)), endTime: startOfHour(addDays(addHours(now, 7), 2)), status: 'SWAPPABLE', userId: '3' },
];

let swapRequests: SwapRequest[] = [
    { id: 'sr1', requesterId: '2', requestedSlotOwnerId: '1', offeredSlotId: 'e5', requestedSlotId: 'e2', status: 'PENDING' }
];

// --- API Simulation ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  await delay(300);
  return users.find(u => u.email === email);
}

export const findUserById = async (id: string): Promise<User | undefined> => {
    await delay(50);
    return users.find(u => u.id === id);
}

export const getMyEvents = async (userId: string): Promise<Event[]> => {
  await delay(300);
  return events.filter(e => e.userId === userId).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

export const getMySwappableEvents = async (userId: string): Promise<Event[]> => {
  await delay(300);
  return events.filter(e => e.userId === userId && e.status === 'SWAPPABLE');
}

export const getMarketplaceEvents = async (userId: string): Promise<(Event & { user: User })[]> => {
  await delay(500);
  const marketplaceEvents = events.filter(e => e.userId !== userId && e.status === 'SWAPPABLE');
  return marketplaceEvents.map(event => {
    const user = users.find(u => u.id === event.userId)!;
    return { ...event, user };
  });
}

export const getPopulatedSwapRequests = async (userId: string): Promise<{
    incoming: PopulatedSwapRequest[],
    outgoing: PopulatedSwapRequest[]
}> => {
    await delay(400);

    const populate = (sr: SwapRequest): PopulatedSwapRequest => {
        return {
            ...sr,
            requester: users.find(u => u.id === sr.requesterId)!,
            requestedSlotOwner: users.find(u => u.id === sr.requestedSlotOwnerId)!,
            offeredSlot: events.find(e => e.id === sr.offeredSlotId)!,
            requestedSlot: events.find(e => e.id === sr.requestedSlotId)!,
        }
    }

    const incoming = swapRequests.filter(sr => sr.requestedSlotOwnerId === userId && sr.status === 'PENDING').map(populate);
    const outgoing = swapRequests.filter(sr => sr.requesterId === userId && sr.status === 'PENDING').map(populate);
    
    return { incoming, outgoing };
}

export const createEvent = async (userId: string, data: Omit<Event, 'id' | 'userId' | 'status'>): Promise<Event> => {
    await delay(300);
    const newEvent: Event = {
        ...data,
        id: `e${events.length + 1}`,
        userId,
        status: 'BUSY'
    };
    events.push(newEvent);
    return newEvent;
}

export const updateEventStatus = async (eventId: string, status: EventStatus): Promise<Event> => {
    await delay(200);
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error("Event not found");
    event.status = status;
    return event;
}

export const createSwapRequest = async (requesterId: string, offeredSlotId: string, requestedSlotId: string): Promise<SwapRequest> => {
    await delay(500);
    const offeredSlot = events.find(e => e.id === offeredSlotId);
    const requestedSlot = events.find(e => e.id === requestedSlotId);

    if (!offeredSlot || !requestedSlot) throw new Error("One or more slots not found");
    if (offeredSlot.status !== 'SWAPPABLE' || requestedSlot.status !== 'SWAPPABLE') {
        throw new Error("Both slots must be swappable");
    }

    offeredSlot.status = 'SWAP_PENDING';
    requestedSlot.status = 'SWAP_PENDING';

    const newRequest: SwapRequest = {
        id: `sr${swapRequests.length + 1}`,
        requesterId,
        offeredSlotId,
        requestedSlotId,
        requestedSlotOwnerId: requestedSlot.userId,
        status: 'PENDING'
    };
    swapRequests.push(newRequest);
    return newRequest;
}

export const respondToSwapRequest = async (requestId: string, accepted: boolean): Promise<SwapRequest> => {
    await delay(500);
    const request = swapRequests.find(sr => sr.id === requestId);
    if (!request) throw new Error("Swap request not found");
    
    const offeredSlot = events.find(e => e.id === request.offeredSlotId);
    const requestedSlot = events.find(e => e.id === request.requestedSlotId);
    if (!offeredSlot || !requestedSlot) throw new Error("One or more slots not found");

    if (accepted) {
        request.status = 'ACCEPTED';
        // The core swap logic: exchange owners
        const originalOfferedOwner = offeredSlot.userId;
        const originalRequestedOwner = requestedSlot.userId;
        offeredSlot.userId = originalRequestedOwner;
        requestedSlot.userId = originalOfferedOwner;
        // Set status back to BUSY
        offeredSlot.status = 'BUSY';
        requestedSlot.status = 'BUSY';
    } else {
        request.status = 'REJECTED';
        // Revert status to SWAPPABLE
        offeredSlot.status = 'SWAPPABLE';
        requestedSlot.status = 'SWAPPABLE';
    }
    
    return request;
}
