import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { token } = await params;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized. Please log in to accept the invitation." }, { status: 401 });
        }

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
        });

        if (!invite) {
            return NextResponse.json({ success: false, message: "Invitation not found" }, { status: 404 });
        }

        if (invite.status !== 'PENDING') {
            return NextResponse.json({ success: false, message: `This invitation is already ${invite.status.toLowerCase()}` }, { status: 400 });
        }

        if (invite.expiresAt < new Date()) {
            return NextResponse.json({ success: false, message: "This invitation has expired" }, { status: 400 });
        }

        // Transactions: Create member and update invite status
        await prisma.$transaction([
            prisma.projectMember.create({
                data: {
                    projectId: invite.projectId,
                    userId: user.id,
                    access: invite.access,
                }
            }),
            prisma.projectInvite.update({
                where: { id: invite.id },
                data: { status: 'ACCEPTED' }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: "Invitation accepted successfully. You now have access to the project."
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
