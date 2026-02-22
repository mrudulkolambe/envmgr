import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { getAuthUser } from "@/lib/api-auth"
import { isObjectId } from "@/lib/validators/objectId"
import { z, ZodError } from "zod"

const UpdateEnvironmentSchema = z.object({
  name: z.string().min(1).max(50).optional(),
})

export async function GET(
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


    if (!isObjectId(id)) {
      return apiResponse({
        message: "Invalid environment ID",
        status: 400,
      })
    }

    const environment = await prisma.environment.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      },
    })

    if (!environment) {
      return apiResponse({
        message: "Environment not found",
        status: 404,
      })
    }

    // 🔐 Check if project belongs to user
    if (environment.project.userId !== user.id) {
        return apiResponse({
            message: "Unauthorized access to project",
            status: 403,
        })
    }

    return apiResponse({
      message: "Environment fetched successfully",
      status: 200,
      data: environment,
    })
  } catch (error) {
    console.error(error)
    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getAuthUser(req)

    if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

    const environment = await prisma.environment.findFirst({
      where: { id, project: { userId: user.id } },
    })

    if (!environment) return apiResponse({ message: "Environment not found", status: 404 })

    const body = await req.json()
    const data = UpdateEnvironmentSchema.parse(body)
    const updated = await prisma.environment.update({ where: { id }, data })

    return apiResponse({ message: "Environment updated successfully", status: 200, data: updated })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({ message: "Validation failed", status: 400, data: error.flatten() })
    }
    console.error(error)
    return apiResponse({ message: "Internal server error", status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const user = await getAuthUser(req)

    if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

    const environment = await prisma.environment.findFirst({
      where: { id, project: { userId: user.id } },
    })

    if (!environment) return apiResponse({ message: "Environment not found", status: 404 })

    // Cascade delete variables first, then environment
    await prisma.variable.deleteMany({ where: { environmentId: id } })
    await prisma.environment.delete({ where: { id } })

    return apiResponse({ message: "Environment deleted successfully", status: 200 })
  } catch (error) {
    console.error(error)
    return apiResponse({ message: "Internal server error", status: 500 })
  }
}
