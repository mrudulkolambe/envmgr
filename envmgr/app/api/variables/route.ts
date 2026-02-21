import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateVariableSchema } from "./validations/variable.validation"
import { ZodError } from "zod"
import { isObjectId } from "@/lib/validators/objectId"

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const body = await req.json()
    const { key, value, isSecret, environmentId } =
      CreateVariableSchema.parse(body)

    const environment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          userId,
        },
      },
      include: {
        project: true,
      },
    })

    if (!environment) {
      return apiResponse({
        message: "Environment not found",
        status: 404,
      })
    }

    const variable = await prisma.variable.create({
      data: {
        key,
        value,
        isSecret,
        environmentId,
      },
    })

    return apiResponse({
      message: "Variable created successfully",
      status: 201,
      data: variable,
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

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const { searchParams } = new URL(req.url)

    const environmentId = searchParams.get("environmentId")
    if (!environmentId) {
      return apiResponse({
        message: "environmentId query param is required",
        status: 400,
      })
    }

    if (!isObjectId(environmentId)) {
      return apiResponse({
        message: "Invalid environmentId",
        status: 400,
      })
    }

    const environment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          userId,
        },
      },
    })

    if (!environment) {
      return apiResponse({
        message: "Environment not found",
        status: 404,
      })
    }

    const search = searchParams.get("search")?.trim()

    const variables = await prisma.variable.findMany({
      where: {
        environmentId,
        ...(search && {
          OR: [
            {
              key: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              value: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      orderBy: { createdAt: "asc" },
    })

    return apiResponse({
      message: "Variables fetched successfully",
      status: 200,
      data: variables,
    })
  } catch (error) {
    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}