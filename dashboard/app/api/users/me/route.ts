import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import User from '@/app/lib/models/User';
import Session from '@/app/lib/models/Session';
import { getAuthUser, getSessionUser, unauthorized } from '@/app/lib/utils/auth';
import { hashPassword, comparePassword } from '@/app/lib/utils/password';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    const fullUser = await User.findById(user._id).select('-passwordHash');
    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fullUser,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { name },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return unauthorized();
    }

    await connectDB();

    await Session.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
