import { NextRequest, NextResponse } from 'next/server';
import { getCLIUser, unauthorized } from '@/app/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCLIUser(request);
    if (!user) {
      return unauthorized('Invalid CLI token');
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Validate CLI token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
