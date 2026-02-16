import { prisma } from "@/lib/prisma";
import { ProjectInviteValidator } from "@/lib/db/validators/invite";
import { z } from "zod";

export type CreateProjectInviteInput = z.infer<
  typeof ProjectInviteValidator.createInviteSchema
>;

export type UpdateProjectInviteStatusInput = z.infer<
  typeof ProjectInviteValidator.updateInviteStatusSchema
>;

export const ProjectInviteModel = {
  create: async (data: CreateProjectInviteInput) => {
    return prisma.projectInvite.create({ data });
  },

  findById: async (id: string) => {
    return prisma.projectInvite.findUnique({
      where: { id },
    });
  },

  findByToken: async (token: string) => {
    return prisma.projectInvite.findUnique({
      where: { token },
    });
  },

  findByProjectId: async (projectId: string) => {
    return prisma.projectInvite.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  },

  findByEmail: async (inviteEmail: string) => {
    return prisma.projectInvite.findMany({
      where: { inviteEmail },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus: async (id: string, data: UpdateProjectInviteStatusInput) => {
    return prisma.projectInvite.update({
      where: { id },
      data,
    });
  },

  deleteById: async (id: string) => {
    return prisma.projectInvite.delete({
      where: { id },
    });
  },

  deleteByToken: async (token: string) => {
    return prisma.projectInvite.delete({
      where: { token },
    });
  },
};
