import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { getAuthUser } from "@/lib/api-auth"
import { UpdateProjectSchema } from "../validations/project.validation"
import { ZodError } from "zod"

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

    const projectData = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        _count: {
          select: { environments: true },
        },
      },
    })

    if (!projectData) {
      return apiResponse({
        message: "Project not found",
        status: 404,
      })
    }

    const project = {
      ...projectData,
      environments: projectData._count.environments,
      _count: undefined,
    }

    return apiResponse({
      message: "Project fetched successfully",
      status: 200,
      data: project,
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

    if (!user) {
      return apiResponse({ message: "Unauthorized", status: 401 })
    }

    const project = await prisma.project.findFirst({ where: { id, userId: user.id } })

    if (!project) {
      return apiResponse({ message: "Project not found", status: 404 })
    }

    const body = await req.json()
    const data = UpdateProjectSchema.parse(body)

    const updated = await prisma.project.update({ where: { id }, data })

    return apiResponse({ message: "Project updated successfully", status: 200, data: updated })
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

    if (!user) {
      return apiResponse({ message: "Unauthorized", status: 401 })
    }

    const project = await prisma.project.findFirst({ where: { id, userId: user.id } })

    if (!project) {
      return apiResponse({ message: "Project not found", status: 404 })
    }

    // Cascade delete: variables → environments → project
    await prisma.variable.deleteMany({
      where: { environment: { projectId: id } },
    })
    await prisma.environment.deleteMany({ where: { projectId: id } })
    await prisma.project.delete({ where: { id } })

    return apiResponse({ message: "Project deleted successfully", status: 200 })
  } catch (error) {
    console.error(error)
    return apiResponse({ message: "Internal server error", status: 500 })
  }
}