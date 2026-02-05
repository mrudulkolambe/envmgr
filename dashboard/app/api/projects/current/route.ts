import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
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
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const membership = await ProjectMember.findOne({
        projectId,
        userId: user._id,
      }).populate({
        path: 'projectId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      });

      if (!membership) {
        return Response.json(
          { success: false, error: 'Not a member of this project' },
          { status: 403 }
        );
      }

      return Response.json({
        success: true,
        data: {
          _id: (membership as any).projectId._id,
          name: (membership as any).projectId.name,
          slug: (membership as any).projectId.slug,
          description: (membership as any).projectId.description,
          organization: {
            _id: (membership as any).projectId.organizationId._id,
            name: (membership as any).projectId.organizationId.name,
            slug: (membership as any).projectId.organizationId.slug,
          },
          projectRole: membership.role,
        },
      });
    }

    const membership = await ProjectMember.findOne({ userId: user._id })
      .populate({
        path: 'projectId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      })
      .sort({ createdAt: 1 });

    if (!membership) {
      return Response.json(
        { success: false, error: 'No projects found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        _id: (membership as any).projectId._id,
        name: (membership as any).projectId.name,
        slug: (membership as any).projectId.slug,
        description: (membership as any).projectId.description,
        organization: {
          _id: (membership as any).projectId.organizationId._id,
          name: (membership as any).projectId.organizationId.name,
          slug: (membership as any).projectId.organizationId.slug,
        },
        projectRole: membership.role,
      },
    });
  } catch (error: any) {
    console.error('Get current project error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch current project' },
      { status: 500 }
    );
  }
}
