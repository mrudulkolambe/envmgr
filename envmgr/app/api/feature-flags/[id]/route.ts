import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { UpdateFeatureFlagSchema } from "../validations/feature-flag.validation"
import { ZodError } from "zod"
import { isObjectId } from "@/lib/validators/objectId"
import { getAuthUser } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)

        if (!user) {
            return apiResponse({
                message: "Unauthorized",
                status: 401,
            })
        }

        const { id } = await params

        if (!isObjectId(id)) {
            return apiResponse({
                message: "Invalid feature flag ID",
                status: 400,
            })
        }

        const featureFlag = await prisma.featureFlag.findFirst({
            where: {
                id,
                project: {
                    userId: user.id,
                },
            },
        })

        if (!featureFlag) {
            return apiResponse({
                message: "Feature flag not found",
                status: 404,
            })
        }

        return apiResponse({
            message: "Feature flag fetched successfully",
            status: 200,
            data: featureFlag,
        })
    } catch (error) {
        console.error(error)
        return apiResponse({
            message: "Internal server error",
            status: 500,
        })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)

        if (!user) {
            return apiResponse({
                message: "Unauthorized",
                status: 401,
            })
        }

        const { id } = await params

        if (!isObjectId(id)) {
            return apiResponse({
                message: "Invalid feature flag ID",
                status: 400,
            })
        }

        // Verify ownership
        const existingFlag = await prisma.featureFlag.findFirst({
            where: {
                id,
                project: {
                    userId: user.id,
                },
            },
        })

        if (!existingFlag) {
            return apiResponse({
                message: "Feature flag not found",
                status: 404,
            })
        }

        const body = await req.json()
        const { name, description, isActive } = UpdateFeatureFlagSchema.parse(body)

        const updatedFlag = await prisma.featureFlag.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isActive !== undefined && { isActive }),
            },
        })

        return apiResponse({
            message: "Feature flag updated successfully",
            status: 200,
            data: updatedFlag,
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getAuthUser(req)

        if (!user) {
            return apiResponse({
                message: "Unauthorized",
                status: 401,
            })
        }

        const { id } = await params

        if (!isObjectId(id)) {
            return apiResponse({
                message: "Invalid feature flag ID",
                status: 400,
            })
        }

        // Verify ownership
        const existingFlag = await prisma.featureFlag.findFirst({
            where: {
                id,
                project: {
                    userId: user.id,
                },
            },
        })

        if (!existingFlag) {
            return apiResponse({
                message: "Feature flag not found",
                status: 404,
            })
        }

        await prisma.featureFlag.delete({
            where: { id },
        })

        return apiResponse({
            message: "Feature flag deleted successfully",
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
