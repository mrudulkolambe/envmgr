import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateEnvironmentSchema } from "./validations/environment.validation"
import { ZodError } from "zod"
import { isObjectId } from "@/lib/validators/objectId"
import { getAuthUser } from "@/lib/api-auth"

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const body = await req.json()
    const { name, projectId } =
      CreateEnvironmentSchema.parse(body)

    if (!isObjectId(projectId)) {
      return apiResponse({
        message: "Invalid projectId",
        status: 400,
      })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })


    if (!project) {
      return apiResponse({
        message: "Project not found",
        status: 404,
      })
    }

    const environment = await prisma.environment.create({
      data: {
        name,
        projectId,
      },
    })

    return apiResponse({
      message: "Environment created successfully",
      status: 201,
      data: environment,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({
        message: "Validation failed",
        status: 400
      })
    }

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const { searchParams } = new URL(req.url)

    const projectId = searchParams.get("projectId")
    if (!projectId) {
      return apiResponse({
        message: "projectId query param is required",
        status: 400,
      })
    }

    if (!isObjectId(projectId)) {
      return apiResponse({
        message: "Invalid projectId",
        status: 400,
      })
    }

    // 🔐 Ensure project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    })

    if (!project) {
      return apiResponse({
        message: "Project not found",
        status: 404,
      })
    }

    const search = searchParams.get("search")?.trim()

    const environmentsData = await prisma.environment.findMany({
      where: {
        projectId,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      include: {
        _count: {
          select: { variables: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    const environments = environmentsData.map((env) => ({
      ...env,
      variables: env._count.variables,
      _count: undefined,
    }))

    return apiResponse({
      message: "Environments fetched successfully",
      status: 200,
      data: environments,
    })
  } catch (error) {
    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}