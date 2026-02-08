import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getOrgMember, requireRole } from '@/app/lib/utils/orgAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { orgId, memberId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);

    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    const { role } = await req.json();

    if (!role || !['owner', 'admin', 'member'].includes(role)) {
      return Response.json(
        { success: false, error: 'Invalid role. Must be owner, admin, or member' },
        { status: 400 }
      );
    }

    if (role === 'owner' && member!.role !== 'owner') {
      return Response.json(
        { success: false, error: 'Only owners can assign owner role' },
        { status: 403 }
      );
    }

    const targetMember = await OrganizationMember.findOne({
      _id: memberId,
      organizationId: orgId,
    });


    if (!targetMember) {
      return Response.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    if (targetMember.role === 'owner' && member!.role !== 'owner') {
      return Response.json(
        { success: false, error: 'Only owners can modify owner roles' },
        { status: 403 }
      );
    }

    targetMember.role = role;
    await targetMember.save();

    return Response.json({
      success: true,
      data: {
        _id: targetMember._id,
        userId: targetMember.userId,
        role: targetMember.role,
      },
    });
  } catch (error: any) {
    console.error('Update member role error:', error);
    return Response.json(
      { success: false, error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  try {
    const { orgId, memberId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);

    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    const targetMember = await OrganizationMember.findOne({
      _id: memberId,
      organizationId: orgId,
    });


    if (!targetMember) {
      return Response.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    if (targetMember.role === 'owner' && targetMember.userId.toString() === user!._id.toString()) {
      return Response.json(
        { success: false, error: 'Owner cannot remove themselves' },
        { status: 403 }
      );
    }

    if (targetMember.role === 'owner' && member!.role !== 'owner') {
      return Response.json(
        { success: false, error: 'Only owners can remove other owners' },
        { status: 403 }
      );
    }

    await OrganizationMember.findByIdAndDelete(memberId);


    return Response.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return Response.json(
      { success: false, error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
