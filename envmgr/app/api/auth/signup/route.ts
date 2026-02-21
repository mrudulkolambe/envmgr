import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ZodError } from "zod"
import { apiResponse } from "@/lib/utils/api-response"
import { AuthValidation } from "../validations/auth.validation"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email, password, name } =
      AuthValidation.validateSignup(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return apiResponse({
        message: "User already exists",
        status: 409,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return apiResponse({
      message: "User created successfully",
      status: 201,
      data: user,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({
        message: "Validation failed",
        status: 400,
        data: error.flatten(),
      })
    }

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}