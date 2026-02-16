import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id, memberId } = await params;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Check project ownership
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project) {
            return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        if (project.ownerId !== user.id) {
            return NextResponse.json({ success: false, message: "Forbidden: Only project owner can remove members" }, { status: 403 });
        }

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId }
        });

        if (!member || member.projectId !== id) {
            return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
        }

        // Prevent owner from removing themselves (sanity check)
        if (member.userId === project.ownerId) {
             return NextResponse.json({ success: false, message: "Cannot remove project owner" }, { status: 400 });
        }

        await prisma.projectMember.delete({
            where: { id: memberId }
        });

        return NextResponse.json({
            success: true,
            message: "Member removed successfully"
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id, memberId } = await params;
        const { access } = await req.json();

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        if (!['VIEW', 'EDIT'].includes(access)) {
            return NextResponse.json({ success: false, message: "Invalid access level" }, { status: 400 });
        }

        // Check project ownership
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project) {
            return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        if (project.ownerId !== user.id) {
            return NextResponse.json({ success: false, message: "Forbidden: Only project owner can update member access" }, { status: 403 });
        }

        const member = await prisma.projectMember.findUnique({
            where: { id: memberId }
        });

        if (!member || member.projectId !== id) {
            return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
        }

        const updatedMember = await prisma.projectMember.update({
            where: { id: memberId },
            data: { access }
        });

        return NextResponse.json({
            success: true,
            message: "Member access updated successfully",
            data: updatedMember
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
