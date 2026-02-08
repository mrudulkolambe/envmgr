import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Environment from '@/app/lib/models/Environment';
import EnvVariable from '@/app/lib/models/EnvVariable';
import { getEnvWithProjectAuth } from '@/app/lib/utils/envAuth';
import { requireOrgRole } from '@/app/lib/utils/projectAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;
    await connectDB();

    const { user, environment, error } = await getEnvWithProjectAuth(req, envId);

    if (error) return error;

    return Response.json({
      success: true,
      data: environment,
    });
  } catch (error: any) {
    console.error('Get environment error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch environment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;
    await connectDB();

    const { user, environment, error } = await getEnvWithProjectAuth(req, envId);

    if (error) return error;

    const { name } = await req.json();

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return Response.json(
          { success: false, error: 'Environment name cannot be empty' },
          { status: 400 }
        );
      }
      environment!.name = name.trim();
    }

    await environment!.save();

    return Response.json({
      success: true,
      data: environment,
    });
  } catch (error: any) {
    console.error('Update environment error:', error);
    return Response.json(
      { success: false, error: 'Failed to update environment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;
    await connectDB();

    const { user, environment, orgMember, error } = await getEnvWithProjectAuth(req, envId);
    if (error) return error;

    const roleError = requireOrgRole(orgMember!.role, 'admin');
    if (roleError) return roleError;

    await EnvVariable.deleteMany({ environmentId: envId });
    await Environment.findByIdAndDelete(envId);


    return Response.json({
      success: true,
      message: 'Environment and its variables deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete environment error:', error);
    return Response.json(
      { success: false, error: 'Failed to delete environment' },
      { status: 500 }
    );
  }
}
