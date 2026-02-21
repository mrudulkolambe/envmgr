import { NextResponse } from "next/server"
import { ApiResponse, PaginationMeta } from "../types/api-response"

export function apiResponse<T>({
  message,
  status,
  data,
  pagination,
}: {
  message: string
  status: number
  data?: T
  pagination?: PaginationMeta
}) {
  const response: ApiResponse<T> = {
    message,
    status,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  }

  return NextResponse.json(response, { status })
}