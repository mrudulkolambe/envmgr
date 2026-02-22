import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { BulkCreateVariableSchema } from "../validations/variable.validation"
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
    const { variables, environmentId } = BulkCreateVariableSchema.parse(body)

    if (!isObjectId(environmentId)) {
      return apiResponse({
        message: "Invalid environmentId",
        status: 400,
      })
    }

    // Verify environment ownership
    const environment = await prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          userId: user.id,
        },
      },
    })


    if (!environment) {
      return apiResponse({
        message: "Environment not found",
        status: 404,
      })
    }

    const results = []

    // Process variables sequentially or in parallel? Parallel is faster.
    // Overwrite logic: using findUnique or upsert now that we have the unique index.
    const promises = variables.map(async (v) => {
        return prisma.variable.upsert({
            where: {
                environmentId_key: {
                    environmentId: environmentId,
                    key: v.key
                }
            },
            update: {
                value: v.value,
                isSecret: v.isSecret ?? false,
            },
            create: {
                key: v.key,
                value: v.value,
                isSecret: v.isSecret ?? false,
                environmentId,
            }
        })
    })

    const upsertedVariables = await Promise.all(promises)

    return apiResponse({
      message: "Variables processed successfully (created or updated)",
      status: 200,
      data: upsertedVariables,
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
