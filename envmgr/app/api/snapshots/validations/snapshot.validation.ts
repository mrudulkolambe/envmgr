import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const CreateSnapshotSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  environmentId: z
    .string()
    .regex(objectIdRegex, "Invalid environmentId"),
})

export type CreateSnapshotInput = z.infer<typeof CreateSnapshotSchema>
