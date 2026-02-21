import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { isObjectId } from "@/lib/validators/objectId"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: snapshotId } = await context.params
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    if (!isObjectId(snapshotId)) {
        return apiResponse({
            message: "Invalid snapshotId",
            status: 400,
        })
    }

    const snapshot = await prisma.snapshot.findUnique({
      where: { id: snapshotId },
      include: {
        environment: {
          include: {
            project: true,
          },
        },
      },
    })

    if (!snapshot) {
      return apiResponse({
        message: "Snapshot not found",
        status: 404,
      })
    }

    // Verify ownership
    if (snapshot.environment.project.userId !== userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const { environmentId, variables } = snapshot as any

    // Restore variables
    // 1. Delete all current variables in the environment
    await prisma.variable.deleteMany({
      where: { environmentId },
    })

    // 2. Create new variables from the snapshot
    const variableData = (variables as any[]).map((v) => ({
      key: v.key,
      value: v.value,
      isSecret: v.isSecret,
      environmentId,
    }))

    if (variableData.length > 0) {
      await prisma.variable.createMany({
        data: variableData,
      })
    }

    return apiResponse({
      message: `Environment successfully restored to snapshot: ${snapshot.name}`,
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
