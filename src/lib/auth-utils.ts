import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/lib/models/user';
import connectDB from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * 🔐 Generate JWT token for a given user ID
 */
export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 🧩 Verify a JWT token and return decoded payload
 */
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded?.id) throw new Error('Invalid token payload');
    return decoded;
  } catch (err: any) {
    console.error('[verifyToken] Invalid or expired token:', err.message);
    return null;
  }
}

/**
 * 👤 Get current user from cookies (for server components)
 */
export async function getCurrentUser() {
  try {
    await connectDB();

    // ✅ FIX for your Next.js version (await required)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('[getCurrentUser] No auth token found in cookies');
      return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('[getCurrentUser] Token invalid or expired');
      return null;
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('[getCurrentUser] User not found for ID:', decoded.id);
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  } catch (error: any) {
    console.error('[getCurrentUser] Error:', error.message);
    return null;
  }
}


/**
 * ⚙️ Validate API requests that include cookies (for route handlers)
 */
export async function validateRequest(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      console.log('[validateRequest] No auth_token found');
      return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('[validateRequest] Invalid or expired token');
      return null;
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('[validateRequest] User not found');
      return null;
    }

    return user;
  } catch (error: any) {
    console.error('[validateRequest] Error:', error.message);
    return null;
  }
}
