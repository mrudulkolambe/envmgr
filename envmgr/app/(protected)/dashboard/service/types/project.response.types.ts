export interface Variable {
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
    environmentId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Environment {
    id: string;
    name: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    variables?: number | Variable[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    environments?: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ListProjectsResponse {
    projects: Project[];
    pagination: Pagination;
}
