import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Environment from '@/lib/models/environment.model';
import Project from '@/lib/models/project.model';

// GET /api/environments/[id] - Get a specific environment
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const environment = await Environment.findById(id);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ environment, success: true });
  } catch (error) {
    console.error('Error fetching environment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/environments/[id] - Update an environment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { name, type, status } = await req.json();
    const { id } = await params;

    const environment = await Environment.findById(id);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const updatedEnvironment = await Environment.findByIdAndUpdate(
      id,
      { 
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(status && { status }),
      },
      { new: true }
    );

    return NextResponse.json({ environment: updatedEnvironment, success: true });
  } catch (error) {
    console.error('Error updating environment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/environments/[id] - Delete an environment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const environment = await Environment.findById(id);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await Environment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Environment deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting environment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
