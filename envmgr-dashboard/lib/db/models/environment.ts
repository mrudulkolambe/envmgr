import { prisma } from "@/lib/prisma";
import { EnvironmentValidator } from "@/lib/db/validators/environment";
import { z } from "zod";

export type CreateEnvironmentInput = z.infer<
  typeof EnvironmentValidator.createEnvironmentSchema
>;

export type UpdateEnvironmentInput = z.infer<
  typeof EnvironmentValidator.updateEnvironmentSchema
>;

export const EnvironmentModel = {
  create: async (data: CreateEnvironmentInput) => {
    return prisma.environment.create({ data });
  },

  findById: async (id: string) => {
    return prisma.environment.findUnique({
      where: { id },
    });
  },

  findByProjectId: async (projectId: string) => {
    return prisma.environment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  updateById: async (id: string, data: UpdateEnvironmentInput) => {
    return prisma.environment.update({
      where: { id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return prisma.environment.delete({
      where: { id },
    });
  },
  findPaginated: async ({
    page = 1,
    limit = 10,
    search = "",
    projectId,
    userId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    userId: string;
  }) => {
    const skip = (page - 1) * limit;
    const where: any = projectId ? {
      projectId
    } : {
        project: {
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } }
            ]
        }
    };


    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.environment.count({ where }),
      prisma.environment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              variables: true,
            },
          },
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
};

