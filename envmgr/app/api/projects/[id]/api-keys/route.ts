import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { getAuthUser } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(req)
        if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

        const { id: projectId } = await params

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: user.id }
        })

        if (!project) return apiResponse({ message: "Project not found", status: 404 })

        const apiKeys = await prisma.apiKey.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" }
        })

        return apiResponse({
            message: "API keys fetched successfully",
            status: 200,
            data: apiKeys
        })
    } catch (error) {
        return apiResponse({ message: "Internal server error", status: 500 })
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthUser(req)
        if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

        const { id: projectId } = await params
        const body = await req.json()
        const { name } = body

        if (!name) return apiResponse({ message: "Name is required", status: 400 })

        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: user.id }
        })

        if (!project) return apiResponse({ message: "Project not found", status: 404 })

        // Generate a random key
        const key = `envmgr_pk_${(await import('node:crypto')).randomBytes(24).toString('hex')}`

        const apiKey = await prisma.apiKey.create({
            data: {
                key,
                name,
                projectId
            }
        })

        return apiResponse({
            message: "API key created successfully",
            status: 201,
            data: apiKey
        })
    } catch (error) {
        console.error(error)
        return apiResponse({ message: "Internal server error", status: 500 })
    }
}
