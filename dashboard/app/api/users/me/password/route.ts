import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import { getSessionUser, unauthorized } from '@/app/lib/utils/auth';
import { hashPassword, comparePassword } from '@/app/lib/utils/password';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const fullUser = await User.findById(user._id);
    if (!fullUser || !fullUser.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isValidPassword = await comparePassword(
      currentPassword,
      fullUser.passwordHash
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { passwordHash: newPasswordHash });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
