import { cookies } from "next/headers";
import { verifyToken } from "@/lib/utils/jwt";
import { TOKEN_KEY } from "@/lib/token";

export async function getAuthUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(TOKEN_KEY)?.value || null;
  }

  if (!token) return null;

  try {
    const decoded = verifyToken(token) as { id: string; email: string } | null;
    return decoded;
  } catch {
    return null;
  }
}
