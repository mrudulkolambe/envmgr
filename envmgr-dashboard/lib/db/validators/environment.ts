import { z } from "zod";

export class EnvironmentValidator {
  static readonly createEnvironmentSchema = z.object({
    name: z.string().min(2, "Environment name must be at least 2 characters"),
    description: z.string().min(3),
    projectId: z.string().min(1, "ProjectId is required"),
  });

  static readonly updateEnvironmentSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  });

  static readonly environmentIdSchema = z.object({
    environmentId: z.string().min(1, "EnvironmentId is required"),
  });
}
