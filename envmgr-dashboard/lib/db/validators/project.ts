import { z } from "zod";

export class ProjectValidator {
  static readonly createProjectSchema = z.object({
    name: z.string().min(2, "Project name must be at least 2 characters"),
    description: z.string().min(3),
    ownerId: z.string().min(1, "OwnerId is required"),
    repo: z.object({
      provider: z.string(),
      owner: z.string(),
      name: z.string(),
    }).optional(),
  });

  static readonly updateProjectSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    repo: z.object({
      provider: z.string(),
      owner: z.string(),
      name: z.string(),
    }).optional(),
  });


  static readonly projectIdSchema = z.object({
    projectId: z.string().min(1, "ProjectId is required"),
  });
}
