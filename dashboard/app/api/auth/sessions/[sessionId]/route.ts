import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const { sessionId } = await params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: user._id,
      type: 'session',
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    await Session.deleteOne({ _id: sessionId });

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error: any) {
    console.error('Revoke session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
