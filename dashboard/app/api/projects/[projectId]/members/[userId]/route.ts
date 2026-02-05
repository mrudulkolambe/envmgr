import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getProjectWithOrgAuth, requireOrgRole } from '@/app/lib/utils/projectAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    await connectDB();

    const { user, project, orgMember, error } = await getProjectWithOrgAuth(req, params.projectId);
    if (error) return error;

    const roleError = requireOrgRole(orgMember!.role, 'admin');
    if (roleError) return roleError;

    const projectMember = await ProjectMember.findOne({
      projectId: params.projectId,
      userId: params.userId,
    });

    if (!projectMember) {
      return Response.json(
        { success: false, error: 'User is not a member of this project' },
        { status: 404 }
      );
    }

    await ProjectMember.findByIdAndDelete(projectMember._id);

    return Response.json({
      success: true,
      message: 'User removed from project',
    });
  } catch (error: any) {
    console.error('Remove project member error:', error);
    return Response.json(
      { success: false, error: 'Failed to remove project member' },
      { status: 500 }
    );
  }
}
