export interface ProjectMember {
    id: string;
    access: 'VIEW' | 'EDIT';
    userId: string;
    projectId: string;
    user: {
        id: string;
        name: string;
        email: string;
        username: string;
    };
    createdAt: string;
}

export interface ProjectInvite {
    id: string;
    projectId: string;
    invitedById: string;
    invitedBy?: {
        name: string;
        email: string;
    };
    inviteEmail: string;
    access: 'VIEW' | 'EDIT';
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
    token: string;
    expiresAt: string;
    createdAt: string;
}

export interface PaginatedMembers {
    data: (ProjectMember | ProjectInvite)[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
