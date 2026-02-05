import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const sessions = await Session.find({
      userId: user._id,
      type: 'session',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })
      .select('-token')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('List sessions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
