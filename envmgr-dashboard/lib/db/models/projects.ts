import { prisma } from "@/lib/prisma";
import { ProjectValidator } from "@/lib/db/validators/project";
import { z } from "zod";

export type CreateProjectInput = z.infer<
  typeof ProjectValidator.createProjectSchema
>;

export type UpdateProjectInput = z.infer<
  typeof ProjectValidator.updateProjectSchema
>;

export const ProjectModel = {
  create: async (data: CreateProjectInput) => {
    return prisma.project.create({ data });
  },

  findById: async (id: string) => {
    return prisma.project.findUnique({
      where: { id },
    });
  },

  findDetailsById: async (id: string) => {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        _count: {
          select: {
            environments: true,
            members: true,
          },
        },
      },
    });
  },


  findByOwnerId: async (ownerId: string) => {
    return prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  updateById: async (id: string, data: UpdateProjectInput) => {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return prisma.project.delete({
      where: { id },
    });
  },

  findPaginated: async ({
    page = 1,
    limit = 10,
    search = "",
    userId,
    memberId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId: string;
    memberId?: string;
  }) => {
    const skip = (page - 1) * limit;
    
    // Base filter: current user must be owner or member
    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    // Additional filter by specific member if provided
    if (memberId) {
        if (!where.AND) where.AND = [];
        where.AND.push({
            OR: [
                { ownerId: memberId },
                { members: { some: { userId: memberId } } }
            ]
        });
    }

    if (search) {
      if (!where.AND) where.AND = [];
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const [total, data] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          _count: {
              select: {
                  environments: true,
                  members: true
              }
          }
        },
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  listAll: async () => {

    return prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
};
