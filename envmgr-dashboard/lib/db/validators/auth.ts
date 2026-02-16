import { z } from "zod";

export class AuthValidator {
  static readonly createUserSchema = z.object({
    name: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  });

  static readonly signupSchema = this.createUserSchema.extend({
    confirmPassword: z.string().min(6),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  static readonly loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
}
