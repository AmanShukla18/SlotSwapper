'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findUserByEmail, updateEventStatus as dbUpdateEventStatus, createSwapRequest as dbCreateSwapRequest, respondToSwapRequest as dbRespondToSwapRequest } from './placeholder-data';
import { revalidatePath } from 'next/cache';
import type { EventStatus } from './types';

export type FormState = {
  message: string;
  success: boolean;
};

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { message: parsed.error.errors.map((e) => e.message).join(', '), success: false };
    }

    const { email } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user) {
      return { message: 'Invalid email or password.', success: false };
    }

    // In a real app, you'd verify the password here.
    // Then, sign a JWT and set it as an HttpOnly cookie.
    cookies().set('auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // One week
      path: '/',
    });
  } catch (error) {
    return { message: 'An unexpected error occurred.', success: false };
  }

  revalidatePath('/');
  redirect('/dashboard');
}

const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});


export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
    // In a real app, you would create a new user in the database.
    // For this mock, we'll just log them in as the first user.
    return login(prevState, formData);
}


export async function logout() {
  cookies().delete('auth_token');
  revalidatePath('/');
  redirect('/login');
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
    try {
        await dbUpdateEventStatus(eventId, status);
        revalidatePath('/dashboard');
        revalidatePath('/marketplace');
        return { success: true, message: `Event status updated to ${status}` };
    } catch (error) {
        return { success: false, message: 'Failed to update event status.' };
    }
}

export async function createSwapRequest(offeredSlotId: string, requestedSlotId: string) {
    try {
        const userCookie = cookies().get('auth_token');
        if(!userCookie) throw new Error("Not authenticated");

        await dbCreateSwapRequest(userCookie.value, offeredSlotId, requestedSlotId);
        revalidatePath('/dashboard');
        revalidatePath('/marketplace');
        revalidatePath('/requests');
        return { success: true, message: 'Swap request sent!' };
    } catch (error) {
        return { success: false, message: (error as Error).message || 'Failed to send swap request.' };
    }
}


export async function respondToSwapRequest(requestId: string, accept: boolean) {
    try {
        await dbRespondToSwapRequest(requestId, accept);
        revalidatePath('/dashboard');
        revalidatePath('/marketplace');
        revalidatePath('/requests');
        return { success: true, message: `Request ${accept ? 'accepted' : 'rejected'}.` };
    } catch (error) {
        return { success: false, message: 'Failed to respond to request.' };
    }
}
