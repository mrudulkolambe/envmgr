import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '../db';
import Session from '../models/Session';
import User from '../models/User';
import { hashToken } from '../utils/token';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export async function getSessionUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return null;
    }

    const hashedToken = hashToken(sessionToken);
    const session = await Session.findOne({
      token: hashedToken,
      type: 'session',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!session) {
      return null;
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };
  } catch (error) {
    console.error('Session auth error:', error);
    return null;
  }
}

export async function getCLIUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const hashedToken = hashToken(token);

    const session = await Session.findOne({
      token: hashedToken,
      type: 'cli',
    });

    if (!session) {
      return null;
    }

    await Session.findByIdAndUpdate(session._id, {
      lastUsedAt: new Date(),
    });

    const user = await User.findById(session.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'user',
    };
  } catch (error) {
    console.error('CLI auth error:', error);
    return null;
  }
}

export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  const cliUser = await getCLIUser(request);
  if (cliUser) return cliUser;

  const sessionUser = await getSessionUser(request);
  if (sessionUser) return sessionUser;

  return null;
}

export function unauthorized(message: string = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}
