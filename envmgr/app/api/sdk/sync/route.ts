import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { validateApiKey } from "@/lib/sdk-auth"

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("x-api-key")

        if (!authHeader) {
            return apiResponse({
                message: "Missing x-api-key header",
                status: 401,
            })
        }

        const apiKey = await validateApiKey(authHeader)

        if (!apiKey) {
            return apiResponse({
                message: "Invalid API key",
                status: 401,
            })
        }

        // Fetch feature flags for the project
        const featureFlags = await prisma.featureFlag.findMany({
            where: {
                projectId: apiKey.projectId,
            },
            select: {
                key: true,
                isActive: true,
            },
        })

        // Transform into a flat object for easier consumption by the SDK
        // e.g. { "feature-a": true, "feature-b": false }
        const flagsMap = featureFlags.reduce((acc, flag) => {
            acc[flag.key] = flag.isActive
            return acc
        }, {} as Record<string, boolean>)

        return apiResponse({
            message: "Project flags fetched successfully",
            status: 200,
            data: {
                flags: flagsMap,
                projectName: apiKey.project.name,
            },
        })
    } catch (error) {
        console.error("SDK sync error:", error)
        return apiResponse({
            message: "Internal server error",
            status: 500,
        })
    }
}
