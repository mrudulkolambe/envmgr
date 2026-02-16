import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { Environment, PaginatedEnvironments } from "./types/environment.response.types";
import { CreateEnvironmentRequest, GetEnvironmentsParams } from "./types/environment.request.types";

class EnvironmentService {
    async getPaginatedEnvironments(
        params: GetEnvironmentsParams,
        { onLoading, onSuccess, onError }: ServiceCallbacks<PaginatedEnvironments>
    ) {
        onLoading(true);
        const response = await API.get<PaginatedEnvironments>(APIRoutes.ENVIRONMENTS, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {

            onError(response.message || 'Failed to fetch environments', response.status);
        }
    }

    async createEnvironment(
        data: CreateEnvironmentRequest,
        { onLoading, onSuccess, onError }: ServiceCallbacks<Environment>
    ) {
        onLoading(true);
        const response = await API.post<Environment>(APIRoutes.ENVIRONMENTS, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create environment', response.status);
        }
    }
}

export { EnvironmentService };
