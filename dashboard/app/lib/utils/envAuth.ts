import { NextRequest } from 'next/server';
import { getAuthUser } from './auth';
import Project from '../models/Project';
import ProjectMember from '../models/ProjectMember';
import OrganizationMember from '../models/OrganizationMember';
import Environment from '../models/Environment';
import mongoose from 'mongoose';

export async function getEnvWithProjectAuth(req: NextRequest, envId: string) {
  const user = await getAuthUser(req);
  if (!user) {
    return { 
      error: Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  if (!mongoose.Types.ObjectId.isValid(envId)) {
    return { 
      error: Response.json(
        { success: false, error: 'Invalid environment ID' },
        { status: 400 }
      )
    };
  }

  const environment = await Environment.findById(envId);
  if (!environment) {
    return {
      error: Response.json(
        { success: false, error: 'Environment not found' },
        { status: 404 }
      )
    };
  }

  const project = await Project.findById(environment.projectId);
  if (!project) {
    return {
      error: Response.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    };
  }

  const projectMember = await ProjectMember.findOne({
    projectId: project._id,
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

  return { user, environment, project, orgMember };
}
