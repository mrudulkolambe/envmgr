import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { getAuthUser } from "@/lib/api-auth"
import { z, ZodError } from "zod"

const FeedbackSchema = z.object({
  description: z.string().min(10, "Please describe your feedback in at least 10 characters").max(2000),
})

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req)

    if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

    const body = await req.json()
    const data = FeedbackSchema.parse(body)

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        description: data.description,
      },
    })

    return apiResponse({ message: "Feedback submitted successfully", status: 201, data: feedback })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiResponse({ message: error.issues[0].message, status: 400 })
    }
    console.error(error)
    return apiResponse({ message: "Internal server error", status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) return apiResponse({ message: "Unauthorized", status: 401 })

    const feedbacks = await prisma.feedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return apiResponse({ message: "Feedback fetched", status: 200, data: feedbacks })
  } catch (error) {
    console.error(error)
    return apiResponse({ message: "Internal server error", status: 500 })
  }
}
