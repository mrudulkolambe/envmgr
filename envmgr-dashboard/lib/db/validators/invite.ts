import { z } from "zod";

export class ProjectInviteValidator {
  static readonly createInviteSchema = z.object({
    projectId: z.string().min(1, "ProjectId is required"),
    invitedById: z.string().min(1, "InvitedById is required"),
    inviteEmail: z.string().email("Invalid email"),
    access: z.enum(["VIEW", "EDIT"]).optional().default("VIEW"),
    token: z.string().min(10, "Token must be at least 10 characters"),
    expiresAt: z.coerce.date(),
  });

  static readonly inviteTokenSchema = z.object({
    token: z.string().min(10, "Token is required"),
  });

  static readonly updateInviteStatusSchema = z.object({
    inviteId: z.string().min(1, "InviteId is required"),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"]),
  });
}
