import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const { tokenId } = await params;

    const session = await Session.findOne({
      _id: tokenId,
      userId: user._id,
      type: 'cli',
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'CLI token not found' },
        { status: 404 }
      );
    }

    await Session.deleteOne({ _id: tokenId });

    return NextResponse.json({
      success: true,
      message: 'CLI token revoked successfully',
    });
  } catch (error: any) {
    console.error('Revoke CLI token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke CLI token' },
      { status: 500 }
    );
  }
}
