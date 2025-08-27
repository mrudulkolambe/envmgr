import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Environment from '@/lib/models/environment.model';
import Project from '@/lib/models/project.model';

// GET /api/environments?projectId=xxx - Get all environments for a project
export async function GET(req: NextRequest) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const environments = await Environment.find({ projectId }).sort({ updatedAt: -1 });
    return NextResponse.json({ environments, success: true });
  } catch (error) {
    console.error('Error fetching environments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/environments - Create a new environment
export async function POST(req: NextRequest) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { name, type, status, projectId } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Environment name is required' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const environment = new Environment({
      name: name.trim(),
      type: type || 'dev',
      status: status || 'active',
      projectId,
      variables: {},
    });

    const savedEnvironment = await environment.save();
    return NextResponse.json({ environment: savedEnvironment, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating environment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
