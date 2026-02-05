import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getOrgMember, requireRole } from '@/app/lib/utils/orgAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    await connectDB();

    const { user, member, error } = await getOrgMember(req, params.orgId);
    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    const { name, description } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const existingProject = await Project.findOne({
      organizationId: params.orgId,
      slug,
    });

    if (existingProject) {
      return Response.json(
        { success: false, error: 'Project with this name already exists in the organization' },
        { status: 409 }
      );
    }

    const project = await Project.create({
      organizationId: params.orgId,
      name: name.trim(),
      slug,
      description: description?.trim() || '',
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: user!._id,
      role: 'maintainer',
    });

    return Response.json(
      {
        success: true,
        data: {
          _id: project._id,
          organizationId: project.organizationId,
          name: project.name,
          slug: project.slug,
          description: project.description,
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create project error:', error);
    return Response.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    await connectDB();

    const { user, member, error } = await getOrgMember(req, params.orgId);
    if (error) return error;

    const projects = await Project.find({ organizationId: params.orgId })
      .sort({ createdAt: -1 });

    const projectIds = projects.map(p => p._id);
    const memberships = await ProjectMember.find({
      projectId: { $in: projectIds },
      userId: user!._id,
    });

    const membershipMap = new Map(
      memberships.map(m => [m.projectId.toString(), m.role])
    );

    const projectsList = projects
      .filter(p => membershipMap.has(p._id.toString()))
      .map(p => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        projectRole: membershipMap.get(p._id.toString()),
        createdAt: p.createdAt,
      }));

    return Response.json({
      success: true,
      data: projectsList,
    });
  } catch (error: any) {
    console.error('List projects error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
