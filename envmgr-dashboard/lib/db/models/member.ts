import { prisma } from "@/lib/prisma";
import { ProjectMemberValidator } from "@/lib/db/validators/member";
import { z } from "zod";

export type CreateProjectMemberInput = z.infer<
  typeof ProjectMemberValidator.addMemberSchema
>;

export type UpdateProjectMemberInput = z.infer<
  typeof ProjectMemberValidator.updateMemberAccessSchema
>;

export const ProjectMemberModel = {
  create: async (data: CreateProjectMemberInput) => {
    return prisma.projectMember.create({ data });
  },

  findById: async (id: string) => {
    return prisma.projectMember.findUnique({
      where: { id },
    });
  },

  findByProjectId: async (projectId: string) => {
    return prisma.projectMember.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByUserId: async (userId: string) => {
    return prisma.projectMember.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByUserAndProject: async (userId: string, projectId: string) => {
    return prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  },

  updateAccess: async (id: string, data: UpdateProjectMemberInput) => {
    return prisma.projectMember.update({
      where: { id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return prisma.projectMember.delete({
      where: { id },
    });
  },

  deleteByUserAndProject: async (userId: string, projectId: string) => {
    return prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  },
};
