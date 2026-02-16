export interface Variable {
    id: string;
    name: string;
    value: string;
    description: string;
    environmentId: string;
    createdAt: string;
    updatedAt: string;
    environment?: {
        id: string;
        name: string;
        project?: {
            id: string;
            name: string;
        };
    };
}

export interface PaginatedVariables {
    data: Variable[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
