import { prisma } from "@/lib/prisma"
import { apiResponse } from "@/lib/utils/api-response"
import { CreateProjectSchema } from "./validations/project.validation"
import { ZodError } from "zod"
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


    const { name, description } =
      CreateProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    })

    return apiResponse({
      message: "Project created successfully",
      status: 201,
      data: {
        ...project,
        environments: 0
      },
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

    const page = Math.max(Number(searchParams.get("page")) || 1, 1)
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50)
    const search = searchParams.get("search")?.trim()

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id,
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

    const [projectsData, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { environments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ])

    const projects = projectsData.map((project) => ({
      ...project,
      environments: project._count.environments,
      _count: undefined,
    }))

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