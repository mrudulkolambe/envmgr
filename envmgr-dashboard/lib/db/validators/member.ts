import { z } from "zod";

export class ProjectMemberValidator {
  static readonly addMemberSchema = z.object({
    userId: z.string().min(1, "UserId is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    access: z.enum(["VIEW", "EDIT"]).optional().default("VIEW"),
  });

  static readonly updateMemberAccessSchema = z.object({
    userId: z.string().min(1, "UserId is required"),
    projectId: z.string().min(1, "ProjectId is required"),
    access: z.enum(["VIEW", "EDIT"]),
  });

  static readonly removeMemberSchema = z.object({
    userId: z.string().min(1, "UserId is required"),
    projectId: z.string().min(1, "ProjectId is required"),
  });
}
