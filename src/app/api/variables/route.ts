import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Environment from '@/lib/models/environment.model';
import Project from '@/lib/models/project.model';

// GET /api/variables?environmentId=xxx - Get all variables for an environment
export async function GET(req: NextRequest) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const environmentId = searchParams.get('environmentId');

    if (!environmentId) {
      return NextResponse.json({ message: 'Environment ID is required' }, { status: 400 });
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

    return NextResponse.json({ variables: environment.variables, success: true });
  } catch (error) {
    console.error('Error fetching variables:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/variables - Add/Update a variable
export async function POST(req: NextRequest) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { environmentId, key, value } = await req.json();

    if (!environmentId || !key) {
      return NextResponse.json({ message: 'Environment ID and variable key are required' }, { status: 400 });
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

    // Update the variable
    environment.variables.set(key, value || '');
    await environment.save();

    return NextResponse.json({ 
      message: 'Variable updated successfully', 
      variables: environment.variables,
      success: true 
    });
  } catch (error) {
    console.error('Error updating variable:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
