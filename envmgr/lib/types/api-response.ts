export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = null> {
  message: string
  status: number
  data?: T
  pagination?: PaginationMeta
}