import { NextResponse } from "next/server"
import { apiResponse } from "@/lib/utils/api-response"

export async function GET() {
  return apiResponse({
    message: "System is healthy",
    status: 200,
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
