import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { connect } from '@/lib/db';
import Project from '@/lib/models/project.model';

// GET /api/projects - Get all projects for the authenticated user
export async function GET() {
  try {
    await connect();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const projects = await Project.find({ userId: user.id }).sort({ updatedAt: -1 });
    return NextResponse.json({ projects, success: true });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
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

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      userId: user.id,
    });

    const savedProject = await project.save();
    return NextResponse.json({ project: savedProject, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
