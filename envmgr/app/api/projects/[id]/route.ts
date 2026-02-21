import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        environments: true,
      },
    })

    if (!project) {
      return apiResponse({
        message: "Project not found",
        status: 404,
      })
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