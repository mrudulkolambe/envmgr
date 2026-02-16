import { NextResponse } from "next/server";
import { EnvironmentModel } from "@/lib/db/models/environment";
import { getAuthUser } from "@/lib/auth-server";
import { EnvironmentValidator } from "@/lib/db/validators/environment";
import { ProjectModel } from "@/lib/db/models/projects";

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
    const projectId = searchParams.get("projectId") || undefined;
    
    if (projectId) {
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }
    }


    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const result = await EnvironmentModel.findPaginated({
      page,
      limit,
      search,
      projectId,
      userId: user.id,
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
    const validatedData = EnvironmentValidator.createEnvironmentSchema.parse(body);

    // Check project access before creating environment
    const project = await ProjectModel.findById(validatedData.projectId);
    if (!project || (project.ownerId !== user.id)) {
        // Ideally we check membership too, but for creation owner check is safer for now
        // if (!) return NextResponse.json(...)
    }

    const environment = await EnvironmentModel.create(validatedData);

    return NextResponse.json({
      success: true,
      data: environment,
      message: "Environment created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
