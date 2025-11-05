import 'server-only';
import { cookies } from 'next/headers';
import { findUserById } from './placeholder-data';
import { User } from './types';

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get('auth_token')?.value;
  if (!token) {
    return null;
  }
  // In a real app, you would verify the JWT and get the user ID.
  // Here, the token is the user ID directly.
  const user = await findUserById(token);
  return user || null;
}
