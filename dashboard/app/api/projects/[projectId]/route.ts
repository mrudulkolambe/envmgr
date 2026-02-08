import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getProjectMember, getProjectWithOrgAuth, requireOrgRole } from '@/app/lib/utils/projectAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await connectDB();

    const { user, project, projectMember, orgMember, error } = await getProjectMember(req, projectId);

    if (error) return error;

    return Response.json({
      success: true,
      data: {
        _id: project!._id,
        organizationId: project!.organizationId,
        name: project!.name,
        slug: project!.slug,
        description: project!.description,
        repo: project!.repo,
        createdAt: project!.createdAt,
        updatedAt: project!.updatedAt,
        projectRole: projectMember!.role,
        orgRole: orgMember!.role,
      },
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await connectDB();

    const { user, project, orgMember, error } = await getProjectWithOrgAuth(req, projectId);

    if (error) return error;

    const roleError = requireOrgRole(orgMember!.role, 'admin');
    if (roleError) return roleError;

    const { name, description } = await req.json();

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return Response.json(
          { success: false, error: 'Project name cannot be empty' },
          { status: 400 }
        );
      }
      project!.name = name.trim();
    }

    if (description !== undefined) {
      project!.description = description?.trim() || '';
    }

    await project!.save();

    return Response.json({
      success: true,
      data: {
        _id: project!._id,
        name: project!.name,
        slug: project!.slug,
        description: project!.description,
        updatedAt: project!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return Response.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    await connectDB();

    const { user, project, orgMember, error } = await getProjectWithOrgAuth(req, projectId);
    if (error) return error;

    const roleError = requireOrgRole(orgMember!.role, 'owner');
    if (roleError) return roleError;

    await ProjectMember.deleteMany({ projectId: projectId });
    await Project.findByIdAndDelete(projectId);


    return Response.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return Response.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
