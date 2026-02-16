import { prisma } from "@/lib/prisma";
import { EnvironmentVariableValidator } from "@/lib/db/validators/variable";
import { z } from "zod";

export type CreateEnvironmentVariableInput = z.infer<
  typeof EnvironmentVariableValidator.createVariableSchema
>;

export type UpdateEnvironmentVariableInput = z.infer<
  typeof EnvironmentVariableValidator.updateVariableSchema
>;

export const EnvironmentVariableModel = {
  create: async (data: CreateEnvironmentVariableInput) => {
    return prisma.environmentVariable.create({ data });
  },

  findById: async (id: string) => {
    return prisma.environmentVariable.findUnique({
      where: { id },
    });
  },

  findByEnvironmentId: async (environmentId: string) => {
    return prisma.environmentVariable.findMany({
      where: { environmentId },
      orderBy: { createdAt: "desc" },
    });
  },

  updateById: async (id: string, data: UpdateEnvironmentVariableInput) => {
    return prisma.environmentVariable.update({
      where: { id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return prisma.environmentVariable.delete({
      where: { id },
    });
  },
  findPaginated: async ({
    page = 1,
    limit = 10,
    search = "",
    environmentId,
    projectId,
    userId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    environmentId?: string;
    projectId?: string;
    userId: string;
  }) => {
    const skip = (page - 1) * limit;
    
    // Base filter: user must have access to the project associated with the variable
    const where: any = {};

    if (environmentId) {
        where.environmentId = environmentId;
    } else if (projectId) {
        where.environment = {
            projectId: projectId
        };
    }

    // Security check: ensure user owns or is a member of the project
    where.environment = {
        ...(where.environment || {}),
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
        { value: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.environmentVariable.count({ where }),
      prisma.environmentVariable.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          environment: {
            select: {
              id: true,
              name: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

