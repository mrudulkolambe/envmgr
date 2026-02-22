import { apiResponse } from "@/lib/utils/api-response"
import { getAuthUser } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)

    if (!user) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
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

