import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Invitation from '@/app/lib/models/Invitation';
import { getOrgMember, requireRole } from '@/app/lib/utils/orgAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    await connectDB();

    const invitation = await Invitation.findById(params.inviteId);

    if (!invitation) {
      return Response.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const { user, member, error } = await getOrgMember(
      req,
      invitation.organizationId.toString()
    );
    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    invitation.status = 'revoked';
    await invitation.save();

    return Response.json({
      success: true,
      message: 'Invitation revoked successfully',
    });
  } catch (error: any) {
    console.error('Revoke invitation error:', error);
    return Response.json(
      { success: false, error: 'Failed to revoke invitation' },
      { status: 500 }
    );
  }
}
