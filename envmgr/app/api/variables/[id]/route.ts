import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { UpdateVariableSchema } from "../validations/variable.validation"
import { ZodError } from "zod"
import { getAuthUser } from "@/lib/api-auth"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getAuthUser(req)

    if (!user) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const variable = await prisma.variable.findFirst({
      where: {
        id,
        environment: {
          project: {
            userId: user.id,
          },
        },
      },
    })

    if (!variable) {
      return apiResponse({
        message: "Variable not found",
        status: 404,
      })
    }

    const body = await req.json()
    const data = UpdateVariableSchema.parse(body)

    const updatedVariable = await prisma.variable.update({
      where: { id },
      data,
    })

    return apiResponse({
      message: "Variable updated successfully",
      status: 200,
      data: updatedVariable,
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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getAuthUser(req)

    if (!user) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const variable = await prisma.variable.findFirst({
      where: {
        id,
        environment: {
          project: {
            userId: user.id,
          },
        },
      },
    })

    if (!variable) {
      return apiResponse({
        message: "Variable not found",
        status: 404,
      })
    }

    await prisma.variable.delete({
      where: { id },
    })

    return apiResponse({
      message: "Variable deleted successfully",
      status: 200,
    })
  } catch (error) {
    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}
