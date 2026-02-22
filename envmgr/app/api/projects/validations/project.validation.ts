import { z } from "zod"

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name must not exceed 50 characters"),

  description: z
    .string()
    .max(300, "Description too long")
    .optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = CreateProjectSchema.partial()
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>