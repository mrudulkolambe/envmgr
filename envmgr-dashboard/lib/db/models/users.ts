import { prisma } from '@/lib/prisma';
import { AuthValidator } from "@/lib/db/validators/auth";
import { z } from "zod";

export type CreateUserInput = z.infer<typeof AuthValidator.createUserSchema>;

export const UserModel = {
  create: async (data: CreateUserInput) => {
    return prisma.user.create({ data });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
};
