import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Environment from '@/lib/models/environment.model';
import Project from '@/lib/models/project.model';

// POST /api/variables/bulk - Bulk import variables from .env format
export async function POST(req: NextRequest) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { environmentId, envText } = await req.json();

    if (!environmentId || !envText) {
      return NextResponse.json({ message: 'Environment ID and env text are required' }, { status: 400 });
    }

    const environment = await Environment.findById(environmentId);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Parse .env format
    const result: Record<string, string> = {};
    envText
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean)
      .forEach((line: string) => {
        if (line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        result[key] = value;
      });

    // Merge with existing variables
    Object.entries(result).forEach(([key, value]) => {
      environment.variables.set(key, value);
    });

    await environment.save();

    return NextResponse.json({ 
      message: 'Variables imported successfully', 
      imported: Object.keys(result).length,
      variables: environment.variables,
      success: true 
    });
  } catch (error) {
    console.error('Error importing variables:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
