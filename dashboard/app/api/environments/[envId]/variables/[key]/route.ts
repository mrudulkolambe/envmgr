import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import EnvVariable from '@/app/lib/models/EnvVariable';
import Environment from '@/app/lib/models/Environment';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getAuthUser } from '@/app/lib/utils/auth';
import { encrypt, decrypt } from '@/app/lib/utils/encryption';
import mongoose from 'mongoose';

async function validateAccess(req: NextRequest, envId: string) {
  const user = await getAuthUser(req);
  if (!user) return { error: Response.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };

  if (!mongoose.Types.ObjectId.isValid(envId)) {
    return { error: Response.json({ success: false, error: 'Invalid environment ID' }, { status: 400 }) };
  }

  const environment = await Environment.findById(envId);
  if (!environment) return { error: Response.json({ success: false, error: 'Environment not found' }, { status: 404 }) };

  const membership = await ProjectMember.findOne({
    projectId: environment.projectId,
    userId: user._id,
  });

  if (!membership) return { error: Response.json({ success: false, error: 'Not a project member' }, { status: 403 }) };

  return { user, environment };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { envId: string; key: string } }
) {
  try {
    await connectDB();
    const { error } = await validateAccess(req, params.envId);
    if (error) return error;

    const variable = await EnvVariable.findOne({
      environmentId: params.envId,
      key: params.key.toUpperCase(),
    });

    if (!variable) {
      return Response.json({ success: false, error: 'Variable not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        key: variable.key,
        value: decrypt(variable.value),
        updatedAt: variable.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Get variable error:', error);
    return Response.json({ success: false, error: 'Failed to fetch variable' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { envId: string; key: string } }
) {
  try {
    await connectDB();
    const { user, environment, error } = await validateAccess(req, params.envId);
    if (error) return error;

    const { value } = await req.json();

    if (value === undefined) {
      return Response.json({ success: false, error: 'Value is required' }, { status: 400 });
    }

    if (!/^[A-Z0-9_]+$/.test(params.key.toUpperCase())) {
      return Response.json({ success: false, error: 'Invalid key format' }, { status: 400 });
    }

    const encryptedValue = encrypt(String(value));

    const variable = await EnvVariable.findOneAndUpdate(
      { environmentId: params.envId, key: params.key.toUpperCase() },
      { 
        projectId: environment!.projectId,
        value: encryptedValue,
        createdBy: user!._id
      },
      { upsert: true, new: true }
    );

    return Response.json({
      success: true,
      data: {
        key: variable.key,
        updatedAt: variable.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update variable error:', error);
    return Response.json({ success: false, error: 'Failed to update variable' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { envId: string; key: string } }
) {
  try {
    await connectDB();
    const { error } = await validateAccess(req, params.envId);
    if (error) return error;

    const result = await EnvVariable.findOneAndDelete({
      environmentId: params.envId,
      key: params.key.toUpperCase(),
    });

    if (!result) {
      return Response.json({ success: false, error: 'Variable not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Variable deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete variable error:', error);
    return Response.json({ success: false, error: 'Failed to delete variable' }, { status: 500 });
  }
}
