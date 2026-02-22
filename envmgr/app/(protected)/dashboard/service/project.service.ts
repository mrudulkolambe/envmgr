import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { CreateProjectRequest, ListProjectsRequest, ListEnvironmentsRequest, ListVariablesRequest } from "./types/project.request.types";
import { ListProjectsResponse, Project, Environment, Variable } from "./types/project.response.types";

class ProjectService {
    async createProject(data: CreateProjectRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<Project>) {
        onLoading(true);
        const response = await API.post<Project>(APIRoutes.PROJECTS, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create project', response.status);
        }
    }

    async listProjects(params: ListProjectsRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<ListProjectsResponse>) {
        onLoading(true);
        const response = await API.get<Project[]>(APIRoutes.PROJECTS, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess({
                projects: response.data,
                pagination: response.pagination!
            });
        } else {
            onError(response.message || 'Failed to fetch projects', response.status);
        }
    }

    async getProject(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<Project>) {
        onLoading(true);
        const response = await API.get<Project>(APIRoutes.PROJECT_DETAILS(id));
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch project details', response.status);
        }
    }

    async listEnvironments(params: ListEnvironmentsRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<Environment[]>) {
        onLoading(true);
        const response = await API.get<Environment[]>(APIRoutes.ENVIRONMENTS, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch environments', response.status);
        }
    }

    async createEnvironment(data: { name: string; projectId: string }, { onLoading, onSuccess, onError }: ServiceCallbacks<Environment>) {
        onLoading(true);
        const response = await API.post<Environment>(APIRoutes.ENVIRONMENTS, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create environment', response.status);
        }
    }

    async getEnvironment(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<Environment>) {
        onLoading(true);
        const response = await API.get<Environment>(APIRoutes.ENVIRONMENT_DETAILS(id));
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch environment details', response.status);
        }
    }

    async listVariables(params: ListVariablesRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<Variable[]>) {
        onLoading(true);
        const response = await API.get<Variable[]>(APIRoutes.VARIABLES, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch variables', response.status);
        }
    }

    async bulkUpdateVariables(data: { environmentId: string, variables: Omit<Variable, 'id' | 'createdAt' | 'updatedAt' | 'environmentId'>[] }, { onLoading, onSuccess, onError }: ServiceCallbacks<Variable[]>) {
        onLoading(true);
        const response = await API.post<Variable[]>(APIRoutes.VARIABLES_BULK, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to bulk update variables', response.status);
        }
    }

    async updateVariable(id: string, data: Partial<Omit<Variable, 'id' | 'environmentId' | 'createdAt' | 'updatedAt'>>, { onLoading, onSuccess, onError }: ServiceCallbacks<Variable>) {
        onLoading(true);
        const response = await API.patch<Variable>(APIRoutes.VARIABLE_DETAILS(id), data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update variable', response.status);
        }
    }

    async deleteVariable(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<void>) {
        onLoading(true);
        const response = await API.delete(APIRoutes.VARIABLE_DETAILS(id));
        onLoading(false);

        if (response.success) {
            onSuccess();
        } else {
            onError(response.message || 'Failed to delete variable', response.status);
        }
    }

    async updateProject(id: string, data: { name?: string; description?: string }, { onLoading, onSuccess, onError }: ServiceCallbacks<Project>) {
        onLoading(true);
        const response = await API.patch<Project>(APIRoutes.PROJECT_DETAILS(id), data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update project', response.status);
        }
    }

    async deleteProject(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<void>) {
        onLoading(true);
        const response = await API.delete(APIRoutes.PROJECT_DETAILS(id));
        onLoading(false);

        if (response.success) {
            onSuccess();
        } else {
            onError(response.message || 'Failed to delete project', response.status);
        }
    }

    async updateEnvironment(id: string, data: { name?: string }, { onLoading, onSuccess, onError }: ServiceCallbacks<Environment>) {
        onLoading(true);
        const response = await API.patch<Environment>(APIRoutes.ENVIRONMENT_DETAILS(id), data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update environment', response.status);
        }
    }

    async deleteEnvironment(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<void>) {
        onLoading(true);
        const response = await API.delete(APIRoutes.ENVIRONMENT_DETAILS(id));
        onLoading(false);

        if (response.success) {
            onSuccess();
        } else {
            onError(response.message || 'Failed to delete environment', response.status);
        }
    }
}

export const projectService = new ProjectService();
export { ProjectService };
