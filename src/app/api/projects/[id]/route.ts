import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Project from '@/lib/models/project.model';
import Environment from '@/lib/models/environment.model';

// GET /api/projects/[id] - Get a specific project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const project = await Project.findOne({ _id: id, userId: user.id });
    
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project, success: true });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    const { id } = await params;
    const project = await Project.findOneAndUpdate(
      { _id: id, userId: user.id },
      { 
        name: name.trim(),
        description: description?.trim() || '',
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project, success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project and all its environments
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const project = await Project.findOne({ _id: id, userId: user.id });
    
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Delete all environments associated with this project
    await Environment.deleteMany({ projectId: id });
    
    // Delete the project
    await Project.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Project deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
