import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { Project, PaginatedProjects } from "./types/project.response.types";
import { CreateProjectRequest, GetProjectsParams } from "./types/project.request.types";


class ProjectService {
    async getPaginatedProjects(
        params: GetProjectsParams,
        { onLoading, onSuccess, onError }: ServiceCallbacks<PaginatedProjects>
    ) {

        onLoading(true);
        const response = await API.get<PaginatedProjects>(APIRoutes.PROJECTS, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch projects', response.status);
        }
    }

    async getProjectById(
        id: string,
        { onLoading, onSuccess, onError }: ServiceCallbacks<Project>
    ) {
        onLoading(true);
        const response = await API.get<Project>(`${APIRoutes.PROJECTS}/${id}`);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch project details', response.status);
        }
    }


    async createProject(
        data: Omit<CreateProjectRequest, 'ownerId'>,
        { onLoading, onSuccess, onError }: ServiceCallbacks<Project>
    ) {
        onLoading(true);
        const response = await API.post<Project>(APIRoutes.PROJECTS, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create project', response.status);
        }
    }
}

export { ProjectService };