export interface OrganizationListItem {
    _id: string;
    name: string;
    slug: string;
    role: string;
    creatorName: string;
    createdAt: string;
}

export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface OrganizationListResponse {
    organizations: OrganizationListItem[];
    pagination: PaginationData;
}
