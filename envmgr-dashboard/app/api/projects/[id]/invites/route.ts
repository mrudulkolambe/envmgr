import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";
import crypto from 'crypto';
import { sendEmail } from "@/lib/mail";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id } = await params;
        const body = await req.json();
        const { email, access } = body;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Fetch user from DB to get their name
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true }
        });

        if (!dbUser) {
             return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        // Check if user is already a member
        const existingMember = await prisma.projectMember.findFirst({
            where: {
                projectId: id,
                user: { email }
            }
        });

        if (existingMember) {
            return NextResponse.json({ success: false, message: "User is already a project member" }, { status: 400 });
        }

        // Check if there's an active invite
        const existingInvite = await prisma.projectInvite.findFirst({
            where: {
                projectId: id,
                inviteEmail: email,
                status: 'PENDING'
            }
        });

        if (existingInvite) {
            return NextResponse.json({ success: false, message: "An invitation is already pending for this email" }, { status: 400 });
        }

        // Create the invite
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        // Fetch project name for the email
        const project = await prisma.project.findUnique({
            where: { id },
            select: { name: true }
        });

        const invite = await prisma.projectInvite.create({
            data: {
                projectId: id,
                invitedById: user.id,
                inviteEmail: email,
                access: access || 'VIEW',
                status: 'PENDING',
                token,
                expiresAt
            }
        });

        // Send invitation email
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invites/${token}`;
        const emailResult = await sendEmail({
            to: email,
            subject: `You've been invited to join ${project?.name || 'a project'} on EnvMgr`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                    <h2 style="color: #0f172a; margin-bottom: 16px;">Project Invitation</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 24px;">
                        Hello,
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 24px;">
                        <strong>${dbUser.name}</strong> has invited you to join the project <strong>${project?.name}</strong> on EnvMgr with <strong>${access}</strong> access.
                    </p>
                    <div style="margin: 32px 0;">
                        <a href="${inviteUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">
                        If you didn't expect this invitation, you can safely ignore this email. This invitation link will expire in 7 days.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                        &copy; ${new Date().getFullYear()} EnvMgr. All rights reserved.
                    </p>
                </div>
            `
        });

        return NextResponse.json({
            success: true,
            data: invite,
            message: emailResult.success 
                ? "Invitation sent successfully" 
                : "Invitation created but email failed to send. Please check your SMTP settings.",
            emailSent: emailResult.success
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
