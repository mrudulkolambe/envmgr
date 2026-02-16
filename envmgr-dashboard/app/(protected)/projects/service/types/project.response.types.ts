export interface Project {
    id: string;
    name: string;
    description: string;
    repo?: {
        provider: string;
        owner: string;
        name: string;
    } | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: {
        id: string;
        name: string;
        email: string;
        username: string;
    };
    _count?: {
        environments: number;
        members: number;
    };
    currentUserAccess?: 'OWNER' | 'EDIT' | 'VIEW';
}

export interface PaginatedProjects {
    data: Project[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
