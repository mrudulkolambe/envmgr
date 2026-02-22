export interface CreateProjectRequest {
    name: string;
    description: string;
}

export interface ListProjectsRequest {
    page?: number;
    limit?: number;
    search?: string;
}

export interface ListEnvironmentsRequest {
    projectId: string;
    search?: string;
}

export interface ListVariablesRequest {
    environmentId: string;
    search?: string;
}
