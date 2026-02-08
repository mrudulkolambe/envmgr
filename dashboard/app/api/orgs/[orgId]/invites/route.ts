import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Invitation from '@/app/lib/models/Invitation';
import { getOrgMember, requireRole } from '@/app/lib/utils/orgAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);
    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    const invitations = await Invitation.find({
      organizationId: orgId,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });


    const invitesList = invitations.map((inv: any) => ({
      _id: inv._id,
      email: inv.email,
      role: inv.role,
      invitedBy: {
        _id: inv.invitedBy._id,
        name: inv.invitedBy.name,
        email: inv.invitedBy.email,
      },
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));

    return Response.json({
      success: true,
      data: invitesList,
    });
  } catch (error: any) {
    console.error('List invitations error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
