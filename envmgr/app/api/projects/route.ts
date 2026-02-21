import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateProjectSchema } from "./validations/project.validation"
import { ZodError } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, description } =
      CreateProjectSchema.parse(body)

    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId,
      },
    })

    return apiResponse({
      message: "Project created successfully",
      status: 201,
      data: project,
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
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return apiResponse({
        message: "Unauthorized",
        status: 401,
      })
    }

    const { searchParams } = new URL(req.url)

    const page = Math.max(Number(searchParams.get("page")) || 1, 1)
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50)
    const search = searchParams.get("search")?.trim()

    const skip = (page - 1) * limit

    const where: any = {
      userId,
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ])

    return apiResponse({
      message: "Projects fetched successfully",
      status: 200,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)

    return apiResponse({
      message: "Internal server error",
      status: 500,
    })
  }
}