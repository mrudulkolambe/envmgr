import { NextResponse } from "next/server";
import { EnvironmentVariableModel } from "@/lib/db/models/variable";
import { getAuthUser } from "@/lib/auth-server";
import { EnvironmentVariableValidator } from "@/lib/db/validators/variable";
import { EnvironmentModel } from "@/lib/db/models/environment";

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
    const environmentId = searchParams.get("environmentId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const result = await EnvironmentVariableModel.findPaginated({
      page,
      limit,
      search,
      environmentId,
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
    const validatedData = EnvironmentVariableValidator.createVariableSchema.parse(body);

    // Verify access to environment
    const environment = await EnvironmentModel.findById(validatedData.environmentId);
    if (!environment) {
        return NextResponse.json(
            { success: false, message: "Environment not found" },
            { status: 404 }
        );
    }
    
    // Additional project ownership/membership check could be added here
    // ...

    const variable = await EnvironmentVariableModel.create(validatedData);

    return NextResponse.json({
      success: true,
      data: variable,
      message: "Variable created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
