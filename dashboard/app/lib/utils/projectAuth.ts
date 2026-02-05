import { NextRequest } from 'next/server';
import { getAuthUser } from './auth';
import Project from '../models/Project';
import ProjectMember from '../models/ProjectMember';
import OrganizationMember from '../models/OrganizationMember';
import mongoose from 'mongoose';

export async function getProjectMember(req: NextRequest, projectId: string) {
  const user = await getAuthUser(req);
  if (!user) {
    return { 
      error: Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return { 
      error: Response.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      )
    };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return {
      error: Response.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    };
  }

  const projectMember = await ProjectMember.findOne({
    projectId,
    userId: user._id,
  });

  if (!projectMember) {
    return {
      error: Response.json(
        { success: false, error: 'Not a member of this project' },
        { status: 403 }
      )
    };
  }

  const orgMember = await OrganizationMember.findOne({
    organizationId: project.organizationId,
    userId: user._id,
  });

  if (!orgMember) {
    return {
      error: Response.json(
        { success: false, error: 'Not a member of the organization' },
        { status: 403 }
      )
    };
  }

  return { user, project, projectMember, orgMember };
}

export async function getProjectWithOrgAuth(req: NextRequest, projectId: string) {
  const user = await getAuthUser(req);
  if (!user) {
    return { 
      error: Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return { 
      error: Response.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      )
    };
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return {
      error: Response.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    };
  }

  const orgMember = await OrganizationMember.findOne({
    organizationId: project.organizationId,
    userId: user._id,
  });

  if (!orgMember) {
    return {
      error: Response.json(
        { success: false, error: 'Not a member of the organization' },
        { status: 403 }
      )
    };
  }

  return { user, project, orgMember };
}

export function requireOrgRole(orgRole: string, requiredRole: 'owner' | 'admin' | 'member') {
  const roleHierarchy = { owner: 3, admin: 2, member: 1 };
  const userLevel = roleHierarchy[orgRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    return Response.json(
      { success: false, error: `Requires organization ${requiredRole.toUpperCase()} role or higher` },
      { status: 403 }
    );
  }
  return null;
}
