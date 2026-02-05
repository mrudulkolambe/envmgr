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
  { params }: { params: { envId: string } }
) {
  try {
    await connectDB();
    const { user, environment, error } = await validateAccess(req, params.envId);
    if (error) return error;

    const dotenvContent = await req.text();
    const lines = dotenvContent.split('\n');
    const variables: { [key: string]: string } = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const firstEquals = trimmedLine.indexOf('=');
      if (firstEquals === -1) continue;

      const key = trimmedLine.substring(0, firstEquals).trim();
      let value = trimmedLine.substring(firstEquals + 1).trim();

      // Basic cleanup of quotes
      if (value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.substring(1, value.length - 1);

      if (/^[A-Z0-9_]+$/.test(key.toUpperCase())) {
        variables[key.toUpperCase()] = value;
      }
    }

    const results = [];
    for (const [key, value] of Object.entries(variables)) {
      const encryptedValue = encrypt(String(value));

      await EnvVariable.findOneAndUpdate(
        { environmentId: params.envId, key: key },
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
      message: `Successfully imported ${results.length} variables from dotenv`,
      data: results,
    });
  } catch (error: any) {
    console.error('Import variables error:', error);
    return Response.json({ success: false, error: 'Failed to import variables' }, { status: 500 });
  }
}
