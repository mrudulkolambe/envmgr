
import { signupSchema, loginSchema } from "./auth.schema"
import { SignupInput, LoginInput } from "./auth.schema"

export class AuthValidation {
  static validateSignup(data: unknown): SignupInput {
    return signupSchema.parse(data)
  }

  static validateLogin(data: unknown): LoginInput {
    return loginSchema.parse(data)
  }
}