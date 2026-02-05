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

    const projectMemberships = await ProjectMember.find({ userId: user._id });
    const projectIds = projectMemberships.map(m => m.projectId);

    const environments = await Environment.find({ projectId: { $in: projectIds } })
      .populate({
        path: 'projectId',
        select: 'name slug organizationId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      })
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      data: environments,
    });
  } catch (error: any) {
    console.error('List user environments error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch environments' },
      { status: 500 }
    );
  }
}
