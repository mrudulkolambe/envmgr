import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Organization from '@/app/lib/models/Organization';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getOrgMember, requireRole } from '@/app/lib/utils/orgAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);
    if (error) return error;

    const organization = await Organization.findById(orgId);

    if (!organization) {
      return Response.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        userRole: member!.role,
      },
    });
  } catch (error: any) {
    console.error('Get organization error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);
    if (error) return error;

    const roleError = requireRole(member!.role, 'admin');
    if (roleError) return roleError;

    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const organization = await Organization.findById(orgId);

    if (!organization) {
      return Response.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    organization.name = name.trim();
    await organization.save();

    return Response.json({
      success: true,
      data: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        updatedAt: organization.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Update organization error:', error);
    return Response.json(
      { success: false, error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    await connectDB();

    const { user, member, error } = await getOrgMember(req, orgId);
    if (error) return error;

    const roleError = requireRole(member!.role, 'owner');
    if (roleError) return roleError;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return Response.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    await OrganizationMember.deleteMany({ organizationId: orgId });
    await Organization.findByIdAndDelete(orgId);


    return Response.json({
      success: true,
      message: 'Organization deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete organization error:', error);
    return Response.json(
      { success: false, error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
