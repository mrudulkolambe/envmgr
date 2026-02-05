import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Environment from '@/app/lib/models/Environment';
import { getProjectMember } from '@/app/lib/utils/projectAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await connectDB();

    const { user, project, projectMember, error } = await getProjectMember(req, params.projectId);
    if (error) return error;

    const { name, slug } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Environment name is required' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      return Response.json(
        { success: false, error: 'Valid slug is required (lowercase, numbers, and hyphens)' },
        { status: 400 }
      );
    }

    const existingEnv = await Environment.findOne({
      projectId: params.projectId,
      slug: slug.toLowerCase().trim(),
    });

    if (existingEnv) {
      return Response.json(
        { success: false, error: 'Environment with this slug already exists in the project' },
        { status: 409 }
      );
    }

    const environment = await Environment.create({
      projectId: params.projectId,
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
    });

    return Response.json(
      {
        success: true,
        data: {
          _id: environment._id,
          projectId: environment.projectId,
          name: environment.name,
          slug: environment.slug,
          createdAt: environment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create environment error:', error);
    return Response.json(
      { success: false, error: 'Failed to create environment' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await connectDB();

    const { error } = await getProjectMember(req, params.projectId);
    if (error) return error;

    const environments = await Environment.find({ projectId: params.projectId })
      .sort({ createdAt: 1 });

    return Response.json({
      success: true,
      data: environments,
    });
  } catch (error: any) {
    console.error('List environments error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch environments' },
      { status: 500 }
    );
  }
}
