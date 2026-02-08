import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import Invitation from '@/app/lib/models/Invitation';
import User from '@/app/lib/models/User';
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

    const members = await OrganizationMember.find({ organizationId: orgId })

      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    const membersList = members.map((m: any) => ({
      _id: m._id,
      userId: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
      joinedAt: m.createdAt,
    }));

    return Response.json({
      success: true,
      data: membersList,
    });
  } catch (error: any) {
    console.error('List members error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { email, role } = await req.json();

    if (!email || typeof email !== 'string') {
      return Response.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (role && !['admin', 'member'].includes(role)) {
      return Response.json(
        { success: false, error: 'Invalid role. Must be admin or member' },
        { status: 400 }
      );
    }

    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (invitedUser) {
      const existingMember = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: invitedUser._id,
      });

      if (existingMember) {
        return Response.json(
          { success: false, error: 'User is already a member of this organization' },
          { status: 409 }
        );
      }

      await OrganizationMember.create({
        organizationId: orgId,
        userId: invitedUser._id,
        role: role || 'member',
      });


      return Response.json(
        {
          success: true,
          message: 'User added to organization',
          data: {
            userId: invitedUser._id,
            email: invitedUser.email,
            name: invitedUser.name,
            role: role || 'member',
          },
        },
        { status: 201 }
      );
    }

    const existingInvite = await Invitation.findOne({
      organizationId: orgId,
      email: email.toLowerCase().trim(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return Response.json(
        { success: false, error: 'Invitation already sent to this email' },
        { status: 409 }
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await Invitation.create({
      organizationId: orgId,
      email: email.toLowerCase().trim(),
      role: role || 'member',

      invitedBy: user!._id,
      expiresAt,
    });

    return Response.json(
      {
        success: true,
        message: 'Invitation sent',
        data: {
          invitationId: invitation._id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Invite member error:', error);
    return Response.json(
      { success: false, error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}
