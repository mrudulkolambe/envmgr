import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Session from '@/app/lib/models/Session';
import { generateToken, hashToken } from '@/app/lib/utils/token';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Token name is required' },
        { status: 400 }
      );
    }

    const token = generateToken('envmgr');
    const hashedToken = hashToken(token);

    const session = await Session.create({
      userId: user._id,
      token: hashedToken,
      type: 'cli',
      name,
      lastUsedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          tokenId: session._id,
          token,
          name: session.name,
          createdAt: session.createdAt,
        },
        warning: 'Save this token securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create CLI token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create CLI token' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const tokens = await Session.find({
      userId: user._id,
      type: 'cli',
    }).select('-token').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: tokens,
    });
  } catch (error: any) {
    console.error('List CLI tokens error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CLI tokens' },
      { status: 500 }
    );
  }
}
