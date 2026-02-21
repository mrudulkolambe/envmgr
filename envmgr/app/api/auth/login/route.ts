import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ZodError } from "zod"
import { apiResponse } from "@/lib/utils/api-response"
import { AuthValidation } from "../validations/auth.validation"
import { SignJWT } from "jose"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { email, password, client = "web" } =
      AuthValidation.validateLogin(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return apiResponse({
        message: "Invalid credentials",
        status: 401,
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    )

    if (!isPasswordValid) {
      return apiResponse({
        message: "Invalid credentials",
        status: 401,
      })
    }

    const allowedClient = client === "cli" ? "cli" : "web"
    const isCLI = allowedClient === "cli"

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    )

    const tokenBuilder = new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()

    if (!isCLI) {
      tokenBuilder.setExpirationTime("7d")
    }

    const token = await tokenBuilder.sign(secret)

    return apiResponse({
      message: `Welcome back, ${user.name}`,
      status: 200,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({
        message: "Validation failed",
        status: 400,
        data: error.flatten(),
      })
    }

    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}