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
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;
    await connectDB();
    const { environment, error } = await validateAccess(req, envId);
    if (error) return error;

    const variables = await EnvVariable.find({ environmentId: envId }).sort({ key: 1 });

    
    const data = variables.map(v => ({
      key: v.key,
      value: '*****', // Masked for listing
      updatedAt: v.updatedAt,
    }));

    return Response.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('List variables error:', error);
    return Response.json({ success: false, error: 'Failed to list variables' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ envId: string }> }
) {
  try {
    const { envId } = await params;
    await connectDB();
    const { user, environment, error } = await validateAccess(req, envId);

    if (error) return error;

    const { variables } = await req.json();

    if (!variables || typeof variables !== 'object') {
      return Response.json({ success: false, error: 'Variables object is required' }, { status: 400 });
    }

    const results = [];
    for (const [key, value] of Object.entries(variables)) {
      if (!/^[A-Z0-9_]+$/.test(key)) {
        continue; // Skip invalid keys
      }

      const encryptedValue = encrypt(String(value));

      await EnvVariable.findOneAndUpdate(
        { environmentId: envId, key: key.toUpperCase() },

        { 
          projectId: environment!.projectId,
          value: encryptedValue,
          createdBy: user!._id
        },
        { upsert: true, new: true }
      );
      results.push(key);
    }

    return Response.json({
      success: true,
      message: `Successfully updated ${results.length} variables`,
      data: results,
    });
  } catch (error: any) {
    console.error('Bulk upsert variables error:', error);
    return Response.json({ success: false, error: 'Failed to update variables' }, { status: 500 });
  }
}
