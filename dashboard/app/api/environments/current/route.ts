import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Environment from '@/app/lib/models/Environment';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getAuthUser } from '@/app/lib/utils/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const envId = searchParams.get('envId');

    if (envId) {
      const environment = await Environment.findById(envId).populate({
        path: 'projectId',
        select: 'name slug organizationId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      });

      if (!environment) {
        return Response.json(
          { success: false, error: 'Environment not found' },
          { status: 404 }
        );
      }

      const membership = await ProjectMember.findOne({
        projectId: environment.projectId,
        userId: user._id,
      });

      if (!membership) {
        return Response.json(
          { success: false, error: 'Not a member of the project for this environment' },
          { status: 403 }
        );
      }

      return Response.json({
        success: true,
        data: environment,
      });
    }

    const projectMemberships = await ProjectMember.find({ userId: user._id });
    const projectIds = projectMemberships.map(m => m.projectId);

    const environment = await Environment.findOne({ projectId: { $in: projectIds } })
      .populate({
        path: 'projectId',
        select: 'name slug organizationId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      })
      .sort({ createdAt: 1 });

    if (!environment) {
      return Response.json(
        { success: false, error: 'No environments found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: environment,
    });
  } catch (error: any) {
    console.error('Get current environment error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch current environment' },
      { status: 500 }
    );
  }
}
