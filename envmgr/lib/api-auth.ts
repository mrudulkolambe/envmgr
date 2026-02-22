import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { TOKEN_KEY } from "@/lib/token";
import { prisma } from "@/lib/prisma";

export async function getAuthUser(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    console.log(authHeader)
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(TOKEN_KEY)?.value || null;
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token) as { userId: string; email: string } | null;
    console.log(decoded)

    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Auth helper error:", error);
    return null;
  }
}
