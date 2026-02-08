import { NextRequest } from 'next/server';
import connectDB from '@/app/lib/db';
import Organization from '@/app/lib/models/Organization';
import OrganizationMember from '@/app/lib/models/OrganizationMember';
import { getAuthUser } from '@/app/lib/utils/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const search = searchParams.get('search')?.trim();
    const skip = (page - 1) * limit;

    const matchStage: any = {
      userId: new mongoose.Types.ObjectId(user._id)
    };

    const searchStage = search
      ? {
          $or: [
            { 'organization.name': { $regex: search, $options: 'i' } },
            { 'organization.slug': { $regex: search, $options: 'i' } }
          ]
        }
      : null;

    const pipeline: any[] = [
      { $match: matchStage },

      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization'
        }
      },
      { $unwind: '$organization' },

      {
        $lookup: {
          from: 'users',
          localField: 'organization.createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },

      ...(searchStage ? [{ $match: searchStage }] : []),

      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: '$organization._id',
                name: '$organization.name',
                slug: '$organization.slug',
                role: '$role',
                creatorName: { $ifNull: ['$creator.name', 'Unknown'] },
                createdAt: '$organization.createdAt'
              }
            }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const [result] = await OrganizationMember.aggregate(pipeline);

    const organizations = result.data;
    const total = result.totalCount[0]?.count || 0;

    return Response.json({
      success: true,
      message: 'Organizations fetched successfully',
      data: {
        organizations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json(
        { success: false, message: 'Organization name is required' },
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
        { success: false, message: 'Organization with this name already exists' },
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
        message: 'Organization created successfully',
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
  } catch (error) {
    console.error('Error creating organization:', error);
    return Response.json(
      { success: false, message: 'Failed to create organization' },
      { status: 500 }
    );
  }
}