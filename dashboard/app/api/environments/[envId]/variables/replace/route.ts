import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import EnvVariable from '@/app/lib/models/EnvVariable';
import Environment from '@/app/lib/models/Environment';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getAuthUser } from '@/app/lib/utils/auth';
import { encrypt } from '@/app/lib/utils/encryption';
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

export async function POST(
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete all existing variables for this environment
      await EnvVariable.deleteMany({ environmentId: envId }).session(session);


      // 2. Insert new variables
      const inserts = Object.entries(variables)
        .filter(([key]) => /^[A-Z0-9_]+$/.test(key))
        .map(([key, value]) => ({
          projectId: environment!.projectId,
          environmentId: envId,
          key: key.toUpperCase(),
          value: encrypt(String(value)),
          createdBy: user!._id,
        }));


      if (inserts.length > 0) {
        await EnvVariable.insertMany(inserts, { session });
      }

      await session.commitTransaction();
      session.endSession();

      return Response.json({
        success: true,
        message: `Successfully replaced variables. Total: ${inserts.length}`,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error: any) {
    console.error('Bulk replace variables error:', error);
    return Response.json({ success: false, error: 'Failed to replace variables' }, { status: 500 });
  }
}
