import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { validateApiKey } from "@/lib/sdk-auth"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const key = searchParams.get("key")
        const authHeader = req.headers.get("x-api-key")

        if (!authHeader) {
            return apiResponse({
                message: "Missing x-api-key header",
                status: 401,
            })
        }

        if (!key) {
            return apiResponse({
                message: "Missing flag key",
                status: 400,
            })
        }

        const apiKey = await validateApiKey(authHeader)

        if (!apiKey) {
            return apiResponse({
                message: "Invalid API key",
                status: 401,
            })
        }

        const featureFlag = await prisma.featureFlag.findUnique({
            where: {
                projectId_key: {
                    projectId: apiKey.projectId,
                    key: key,
                },
            },
            select: {
                isActive: true,
            },
        })

        if (!featureFlag) {
            return apiResponse({
                message: "Feature flag not found",
                status: 404,
            })
        }

        return apiResponse({
            message: "Flag fetched successfully",
            status: 200,
            data: {
                isEnabled: featureFlag.isActive,
            },
        })
    } catch (error) {
        console.error("SDK check error:", error)
        return apiResponse({
            message: "Internal server error",
            status: 500,
        })
    }
}
