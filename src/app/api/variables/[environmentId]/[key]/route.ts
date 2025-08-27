import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Environment from '@/lib/models/environment.model';
import Project from '@/lib/models/project.model';

// PUT /api/variables/[environmentId]/[key] - Update a specific variable
export async function PUT(req: NextRequest, { params }: { params: Promise<{ environmentId: string; key: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { value } = await req.json();
    const { environmentId, key } = await params;

    const environment = await Environment.findById(environmentId);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Update the specific variable
    environment.variables.set(key, value || '');
    await environment.save();

    return NextResponse.json({ 
      message: 'Variable updated successfully', 
      key,
      value: value || '',
      success: true 
    });
  } catch (error) {
    console.error('Error updating variable:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/variables/[environmentId]/[key] - Delete a specific variable
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ environmentId: string; key: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { environmentId, key } = await params;

    const environment = await Environment.findById(environmentId);
    
    if (!environment) {
      return NextResponse.json({ message: 'Environment not found' }, { status: 404 });
    }

    // Verify project ownership
    const project = await Project.findOne({ _id: environment.projectId, userId: user.id });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Delete the variable
    environment.variables.delete(key);
    await environment.save();

    return NextResponse.json({ 
      message: 'Variable deleted successfully', 
      key,
      success: true 
    });
  } catch (error) {
    console.error('Error deleting variable:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
