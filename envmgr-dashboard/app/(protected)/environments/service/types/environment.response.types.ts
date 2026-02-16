export interface Environment {
    id: string;
    name: string;
    description: string;
    project: {
        id: string;
        name: string;
    };

    createdAt: string;
    updatedAt: string;
    _count?: {
        variables: number;
    };
}

export interface PaginatedEnvironments {
    data: Environment[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
