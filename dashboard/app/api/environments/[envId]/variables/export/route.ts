import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import EnvVariable from '@/app/lib/models/EnvVariable';
import Environment from '@/app/lib/models/Environment';
import ProjectMember from '@/app/lib/models/ProjectMember';
import { getAuthUser } from '@/app/lib/utils/auth';
import { decrypt } from '@/app/lib/utils/encryption';
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
    const { error } = await validateAccess(req, envId);
    if (error) return error;

    const variables = await EnvVariable.find({ environmentId: envId }).sort({ key: 1 });

    
    const dotenvContent = variables
      .map(v => `${v.key}=${decrypt(v.value)}`)
      .join('\n');

    return new Response(dotenvContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=".env.${envId}"`,
      },
    });

  } catch (error: any) {
    console.error('Export variables error:', error);
    return Response.json({ success: false, error: 'Failed to export variables' }, { status: 500 });
  }
}
