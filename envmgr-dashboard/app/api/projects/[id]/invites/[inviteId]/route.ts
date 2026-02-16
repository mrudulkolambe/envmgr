import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id, inviteId } = await params;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Check if user is owner of the project (only owner can cancel invites for now)
        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project) {
            return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        if (project.ownerId !== user.id) {
            return NextResponse.json({ success: false, message: "Forbidden: Only project owner can cancel invitations" }, { status: 403 });
        }

        const invite = await prisma.projectInvite.findUnique({
            where: { id: inviteId }
        });

        if (!invite || invite.projectId !== id) {
            return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 });
        }

        await prisma.projectInvite.delete({
            where: { id: inviteId }
        });

        return NextResponse.json({
            success: true,
            message: "Invitation cancelled successfully"
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id, inviteId } = await params;
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
            return NextResponse.json({ success: false, message: "Forbidden: Only project owner can update invitation access" }, { status: 403 });
        }

        const invite = await prisma.projectInvite.findUnique({
            where: { id: inviteId }
        });

        if (!invite || invite.projectId !== id) {
            return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 });
        }

        const updatedInvite = await prisma.projectInvite.update({
            where: { id: inviteId },
            data: { access }
        });

        return NextResponse.json({
            success: true,
            message: "Invitation access updated successfully",
            data: updatedInvite
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
