import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Organization from '@/app/lib/models/Organization';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getAuthUser } from '@/app/lib/utils/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return Response.json(
        { success: false, error: 'Organization with this name already exists' },
        { status: 409 }
      );
    }

    const organization = await Organization.create({
      name: name.trim(),
      slug,
      createdBy: user._id,
    });

    await OrganizationMember.create({
      organizationId: organization._id,
      userId: user._id,
      role: 'owner',
    });

    return Response.json(
      {
        success: true,
        data: {
          _id: organization._id,
          name: organization.name,
          slug: organization.slug,
          createdBy: organization.createdBy,
          createdAt: organization.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create organization error:', error);
    return Response.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const memberships = await OrganizationMember.find({ userId: user._id })
      .populate('organizationId')
      .sort({ createdAt: -1 });

    const organizations = memberships.map((membership: any) => ({
      _id: membership.organizationId._id,
      name: membership.organizationId.name,
      slug: membership.organizationId.slug,
      role: membership.role,
      createdAt: membership.organizationId.createdAt,
    }));

    return Response.json({
      success: true,
      data: organizations,
    });
  } catch (error: any) {
    console.error('List organizations error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
