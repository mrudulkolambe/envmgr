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

    const memberships = await ProjectMember.find({ userId: user._id })
      .populate({
        path: 'projectId',
        populate: {
          path: 'organizationId',
          select: 'name slug',
        },
      })
      .sort({ createdAt: -1 });

    const projectsList = memberships.map((m: any) => ({
      _id: m.projectId._id,
      name: m.projectId.name,
      slug: m.projectId.slug,
      description: m.projectId.description,
      organization: {
        _id: m.projectId.organizationId._id,
        name: m.projectId.organizationId.name,
        slug: m.projectId.organizationId.slug,
      },
      projectRole: m.role,
      createdAt: m.projectId.createdAt,
    }));

    return Response.json({
      success: true,
      data: projectsList,
    });
  } catch (error: any) {
    console.error('List user projects error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
