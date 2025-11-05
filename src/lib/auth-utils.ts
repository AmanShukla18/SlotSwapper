import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/lib/models/user';
import connectDB from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;
    
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function validateRequest(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    await connectDB();
    const decoded = await verifyToken(token);
    if (!decoded) return null;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return null;

    return user;
  } catch (error) {
    console.error('Error validating request:', error);
    return null;
  }
}