import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { Variable, PaginatedVariables } from "./types/variable.response.types";
import { CreateVariableRequest, GetVariablesParams } from "./types/variable.request.types";

class VariableService {
    async getPaginatedVariables(
        params: GetVariablesParams,
        { onLoading, onSuccess, onError }: ServiceCallbacks<PaginatedVariables>
    ) {
        onLoading(true);
        const response = await API.get<PaginatedVariables>(APIRoutes.VARIABLES, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch variables', response.status);
        }
    }

    async createVariable(
        data: CreateVariableRequest,
        { onLoading, onSuccess, onError }: ServiceCallbacks<Variable>
    ) {
        onLoading(true);
        const response = await API.post<Variable>(APIRoutes.VARIABLES, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create variable', response.status);
        }
    }
}

export { VariableService };
