import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: {
                project: {
                    select: { name: true, description: true }
                },
                invitedBy: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!invite) {
            return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 });
        }

        if (invite.status !== 'PENDING') {
            return NextResponse.json({ success: false, message: `This invitation has already been ${invite.status.toLowerCase()}` }, { status: 400 });
        }

        if (invite.expiresAt < new Date()) {
            return NextResponse.json({ success: false, message: "This invitation has expired" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data: invite
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
