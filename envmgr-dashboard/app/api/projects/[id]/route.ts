import { NextResponse } from "next/server";
import { ProjectModel } from "@/lib/db/models/projects";
import { getAuthUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id } = await params;

        if (!user || !user.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const project = await ProjectModel.findDetailsById(id);

        if (!project) {
            return NextResponse.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }

        // Determine requesting user's access level
        let access = null;

        if (project.ownerId === user.id) {
            access = 'OWNER';
        } else {
            const membership = await prisma.projectMember.findUnique({
                where: {
                    userId_projectId: {
                        userId: user.id,
                        projectId: id
                    }
                },
                select: { access: true }
            });

            if (membership) {
                access = membership.access;
            }
        }

        if (!access) {
            return NextResponse.json(
                { success: false, message: "Forbidden: You do not have access to this project" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...project,
                currentUserAccess: access
            },
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
