import { z } from "zod";

export class EnvironmentVariableValidator {
  static readonly createVariableSchema = z.object({
    name: z.string().min(1, "Variable name is required"),
    value: z.string().min(1, "Variable value is required"),
    description: z.string().min(3),
    environmentId: z.string().min(1, "EnvironmentId is required"),
  });

  static readonly updateVariableSchema = z.object({
    name: z.string().min(1).optional(),
    value: z.string().min(1).optional(),
    description: z.string().optional(),
  });

  static readonly variableIdSchema = z.object({
    variableId: z.string().min(1, "VariableId is required"),
  });
}
