import { z } from "zod"

const objectIdRegex = /^[a-f\d]{24}$/i

export const CreateVariableSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(100, "Key too long"),

  value: z.string().min(1, "Value is required"),

  isSecret: z.boolean().optional().default(false),

  environmentId: z
    .string()
    .regex(objectIdRegex, "Invalid environmentId"),
})

export type CreateVariableInput = z.infer<
  typeof CreateVariableSchema
>

export const BulkCreateVariableSchema = z.object({
  environmentId: z
    .string()
    .regex(objectIdRegex, "Invalid environmentId"),
  variables: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.string().min(1),
    isSecret: z.boolean().optional().default(false),
  })).min(1, "At least one variable is required"),
})

export type BulkCreateVariableInput = z.infer<
  typeof BulkCreateVariableSchema
>