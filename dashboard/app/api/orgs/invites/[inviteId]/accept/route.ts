import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Invitation from '@/app/lib/models/Invitation';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getSessionUser } from '@/app/lib/utils/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;
    await connectDB();

    const user = await getSessionUser(req);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invitation = await Invitation.findById(inviteId);


    if (!invitation) {
      return Response.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'pending') {
      return Response.json(
        { success: false, error: 'Invitation is no longer valid' },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return Response.json(
        { success: false, error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    if (invitation.email !== user.email) {
      return Response.json(
        { success: false, error: 'This invitation is not for your email' },
        { status: 403 }
      );
    }

    const existingMember = await OrganizationMember.findOne({
      organizationId: invitation.organizationId,
      userId: user._id,
    });

    if (existingMember) {
      return Response.json(
        { success: false, error: 'You are already a member of this organization' },
        { status: 409 }
      );
    }

    await OrganizationMember.create({
      organizationId: invitation.organizationId,
      userId: user._id,
      role: invitation.role,
    });

    invitation.status = 'accepted';
    await invitation.save();

    return Response.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    return Response.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
