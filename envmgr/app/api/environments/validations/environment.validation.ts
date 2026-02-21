import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const CreateEnvironmentSchema = z.object({
  name: z
    .string()
    .min(2, "Environment name is required")
    .max(30, "Environment name too long"),

  projectId: z
    .string()
    .regex(objectIdRegex, "Invalid projectId"),
})

export type CreateEnvironmentInput = z.infer<
  typeof CreateEnvironmentSchema
>