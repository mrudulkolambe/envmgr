import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getAuthUser } from '@/app/lib/utils/auth';

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

    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    if (orgId) {
      const member = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: user._id,
      }).populate('organizationId');

      if (!member) {
        return Response.json(
          { success: false, error: 'Not a member of this organization' },
          { status: 403 }
        );
      }

      return Response.json({
        success: true,
        data: {
          _id: (member as any).organizationId._id,
          name: (member as any).organizationId.name,
          slug: (member as any).organizationId.slug,
          role: member.role,
        },
      });
    }

    const membership = await OrganizationMember.findOne({ userId: user._id })
      .populate('organizationId')
      .sort({ createdAt: 1 });

    if (!membership) {
      return Response.json(
        { success: false, error: 'No organizations found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: {
        _id: (membership as any).organizationId._id,
        name: (membership as any).organizationId.name,
        slug: (membership as any).organizationId.slug,
        role: membership.role,
      },
    });
  } catch (error: any) {
    console.error('Get current org error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch current organization' },
      { status: 500 }
    );
  }
}
