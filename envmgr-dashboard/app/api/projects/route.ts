import { NextResponse } from "next/server";
import { ProjectModel } from "@/lib/db/models/projects";
import { getAuthUser } from "@/lib/auth-server";
import { ProjectValidator } from "@/lib/db/validators/project";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const memberId = searchParams.get("memberId") || undefined;

    const result = await ProjectModel.findPaginated({
      page,
      limit,
      search,
      userId: user.id,
      memberId,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Auto-assign ownerId from authenticated user
    const validatedData = ProjectValidator.createProjectSchema.parse({
        ...body,
        ownerId: user.id
    });

    const project = await ProjectModel.create(validatedData);

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
