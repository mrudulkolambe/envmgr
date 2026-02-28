import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateFeatureFlagSchema } from "./validations/feature-flag.validation"
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
        const { name, key, description, projectId, isActive } =
            CreateFeatureFlagSchema.parse(body)

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

        // Check if key already exists for this project
        const existingFlag = await prisma.featureFlag.findUnique({
            where: {
                projectId_key: {
                    projectId,
                    key,
                },
            },
        })

        if (existingFlag) {
            return apiResponse({
                message: "Feature flag with this key already exists in this project",
                status: 400,
            })
        }

        const featureFlag = await prisma.featureFlag.create({
            data: {
                name,
                key,
                description,
                projectId,
                isActive,
            },
        })

        return apiResponse({
            message: "Feature flag created successfully",
            status: 201,
            data: featureFlag,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return apiResponse({
                message: "Validation failed",
                status: 400,
                data: error.flatten(),
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

        // Ensure project belongs to user
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

        const featureFlags = await prisma.featureFlag.findMany({
            where: {
                projectId,
                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            key: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },
            orderBy: { createdAt: "desc" },
        })

        return apiResponse({
            message: "Feature flags fetched successfully",
            status: 200,
            data: featureFlags,
        })
    } catch (error) {
        console.error(error)
        return apiResponse({
            message: "Internal server error",
            status: 500,
        })
    }
}
