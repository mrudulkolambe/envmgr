import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import { hashToken } from '@/app/lib/utils/token';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      const hashedToken = hashToken(sessionToken);
      await Session.deleteOne({ token: hashedToken });
    }

    cookieStore.delete('session_token');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
