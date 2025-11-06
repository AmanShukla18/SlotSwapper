'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    const response = await fetch(new URL('/api/auth/login', base).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    revalidatePath('/');
    return { success: true, message: 'Logged in successfully' };
  } catch (error: any) {
    return { message: error?.message || 'An unexpected error occurred.', success: false };
  }
}

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { message: parsed.error.errors.map((e) => e.message).join(', '), success: false };
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    const response = await fetch(new URL('/api/auth/signup', base).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    revalidatePath('/');
    return { success: true, message: 'Account created successfully' };
  } catch (error: any) {
    return { message: error?.message || 'An unexpected error occurred.', success: false };
  }
}

export async function logout() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    await fetch(new URL('/api/auth/logout', base).toString());
    revalidatePath('/');
    redirect('/login');
  } catch (error: any) {
    console.error('Logout error:', error?.message);
  }
}

export async function updateEventStatus(eventId: string, status: EventStatus) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    const response = await fetch(new URL(`/api/events/${eventId}/status`, base).toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update status');
    }

    revalidatePath('/dashboard');
    revalidatePath('/marketplace');
    return { success: true, message: 'Status updated successfully' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to update status' };
  }
}

export async function createSwapRequest(offeredSlotId: string, requestedSlotId: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    const response = await fetch(new URL('/api/swap-requests', base).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mySlotId: offeredSlotId,
        theirSlotId: requestedSlotId
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create swap request');
    }

    revalidatePath('/dashboard');
    revalidatePath('/marketplace');
    revalidatePath('/requests');
    return { success: true, message: 'Swap request sent successfully' };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to create swap request' };
  }
}

export async function respondToSwapRequest(requestId: string, accept: boolean) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    const response = await fetch(new URL(`/api/swap-requests/${requestId}/response`, base).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to respond to request');
    }

    revalidatePath('/dashboard');
    revalidatePath('/marketplace');
    revalidatePath('/requests');
    return { success: true, message: data.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to respond to request' };
  }
}
