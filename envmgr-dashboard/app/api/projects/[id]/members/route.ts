import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser(req);
        const { id } = await params;

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            select: { ownerId: true }
        });

        if (!project) {
            return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
        }

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const search = url.searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        // In this implementation, we combine Members and Pending Invites
        const [members, invites, totalMembers, totalInvites] = await Promise.all([
            prisma.projectMember.findMany({
                where: {
                    projectId: id,
                    user: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true, username: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.projectInvite.findMany({
                where: {
                    projectId: id,
                    status: 'PENDING',
                    inviteEmail: { contains: search, mode: 'insensitive' }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.projectMember.count({
                where: {
                    projectId: id,
                    user: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            }),
            prisma.projectInvite.count({
                where: {
                    projectId: id,
                    status: 'PENDING',
                    inviteEmail: { contains: search, mode: 'insensitive' }
                }
            })
        ]);

        const total = totalMembers + totalInvites;
        
        // Interleave or just append invites at the end (for now simpler to just combine and sort by date)
        const combined = [...members, ...invites].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, limit);

        return NextResponse.json({
            success: true,
            data: {
                data: combined,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
