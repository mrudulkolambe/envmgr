import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import ProjectMember from '@/app/lib/models/ProjectMember';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getProjectMember, getProjectWithOrgAuth, requireOrgRole } from '@/app/lib/utils/projectAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await connectDB();

    const { user, project, projectMember, error } = await getProjectMember(req, params.projectId);
    if (error) return error;

    const members = await ProjectMember.find({ projectId: params.projectId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });

    const membersList = members.map((m: any) => ({
      _id: m._id,
      userId: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
      addedAt: m.createdAt,
    }));

    return Response.json({
      success: true,
      data: membersList,
    });
  } catch (error: any) {
    console.error('List project members error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch project members' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await connectDB();

    const { user, project, orgMember, error } = await getProjectWithOrgAuth(req, params.projectId);
    if (error) return error;

    const roleError = requireOrgRole(orgMember!.role, 'admin');
    if (roleError) return roleError;

    const { userId } = await req.json();

    if (!userId || typeof userId !== 'string') {
      return Response.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const targetOrgMember = await OrganizationMember.findOne({
      organizationId: project!.organizationId,
      userId,
    }).populate('userId', 'name email');

    if (!targetOrgMember) {
      return Response.json(
        { success: false, error: 'User is not a member of the organization' },
        { status: 400 }
      );
    }

    const existingProjectMember = await ProjectMember.findOne({
      projectId: params.projectId,
      userId,
    });

    if (existingProjectMember) {
      return Response.json(
        { success: false, error: 'User is already a member of this project' },
        { status: 409 }
      );
    }

    const projectMember = await ProjectMember.create({
      projectId: params.projectId,
      userId,
      role: 'viewer',
    });

    return Response.json(
      {
        success: true,
        message: 'User added to project',
        data: {
          _id: projectMember._id,
          userId: (targetOrgMember as any).userId._id,
          name: (targetOrgMember as any).userId.name,
          email: (targetOrgMember as any).userId.email,
          role: projectMember.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Add project member error:', error);
    return Response.json(
      { success: false, error: 'Failed to add project member' },
      { status: 500 }
    );
  }
}
