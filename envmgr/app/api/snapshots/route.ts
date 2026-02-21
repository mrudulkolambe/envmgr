import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateSnapshotSchema } from "./validations/snapshot.validation"
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
    const { name, description, environmentId } = CreateSnapshotSchema.parse(body)

    const environment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          userId,
        },
      },
      include: {
        variables: true,
      },
    })

    if (!environment) {
      return apiResponse({
        message: "Environment not found",
        status: 404,
      })
    }

    // Check if name is unique for this environment
    const existingSnapshot = await prisma.snapshot.findFirst({
      where: {
        environmentId,
        name,
      },
    })

    if (existingSnapshot) {
      return apiResponse({
        message: "Snapshot name must be unique for this environment",
        status: 400,
      })
    }

    // Prepare variables for snapshot
    const variablesToSnapshot = environment.variables.map((v) => ({
      key: v.key,
      value: v.value,
      isSecret: v.isSecret,
    }))

    const snapshot = await prisma.snapshot.create({
      data: {
        name,
        description,
        environmentId,
        variables: variablesToSnapshot,
      },
    })

    return apiResponse({
      message: "Snapshot created successfully",
      status: 201,
      data: snapshot,
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

    const snapshots = await prisma.snapshot.findMany({
      where: {
        environmentId,
      },
      orderBy: { createdAt: "desc" },
    })

    return apiResponse({
      message: "Snapshots fetched successfully",
      status: 200,
      data: snapshots,
    })
  } catch (error) {
    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}
