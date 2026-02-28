import { z } from "zod"

export const CreateFeatureFlagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  key: z.string().min(1, "Key is required").max(100).regex(/^[a-zA-Z0-z0-9_-]+$/, "Key must contain only letters, numbers, underscores, and hyphens"),
  description: z.string().max(500).optional(),
  projectId: z.string().min(1, "ProjectId is required"),
  isActive: z.boolean().default(false),
})

export const UpdateFeatureFlagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})
