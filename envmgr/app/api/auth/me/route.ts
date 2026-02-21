import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return apiResponse({
        message: "User not found",
        status: 404,
      })
    }

    return apiResponse({
      message: "User profile fetched successfully",
      status: 200,
      data: user,
    })
  } catch (error) {
    console.error(error)
    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}
