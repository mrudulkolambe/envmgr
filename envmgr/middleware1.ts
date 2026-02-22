import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const publicRoutes = ["/api/auth/login", "/api/auth/signup", "/api/health"]
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next()
    }

    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
        console.log("No auth header")
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        )
    }

    const token = authHeader.replace("Bearer ", "")

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)

        const { payload } = await jwtVerify(token, secret)

        const response = NextResponse.next()
        response.headers.set("x-user-id", payload.userId as string)

        return response
    } catch {
        return NextResponse.json(
            { message: "Invalid token" },
            { status: 401 }
        )
    }
}

export const config = {
    matcher: ["/api/:path*"],
}