import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { FeatureFlag } from "./types/feature-flag.response.types";

class FeatureFlagService {
    async listFeatureFlags(params: { projectId: string; search?: string }, { onLoading, onSuccess, onError }: ServiceCallbacks<FeatureFlag[]>) {
        onLoading(true);
        const response = await API.get<FeatureFlag[]>(APIRoutes.FEATURE_FLAGS, params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch feature flags', response.status);
        }
    }

    async createFeatureFlag(data: { name: string; key: string; description?: string; projectId: string; isActive?: boolean }, { onLoading, onSuccess, onError }: ServiceCallbacks<FeatureFlag>) {
        onLoading(true);
        const response = await API.post<FeatureFlag>(APIRoutes.FEATURE_FLAGS, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to create feature flag', response.status);
        }
    }

    async updateFeatureFlag(id: string, data: { name?: string; description?: string | null; isActive?: boolean }, { onLoading, onSuccess, onError }: ServiceCallbacks<FeatureFlag>) {
        onLoading(true);
        const response = await API.patch<FeatureFlag>(APIRoutes.FEATURE_FLAG_DETAILS(id), data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update feature flag', response.status);
        }
    }

    async deleteFeatureFlag(id: string, { onLoading, onSuccess, onError }: ServiceCallbacks<void>) {
        onLoading(true);
        const response = await API.delete(APIRoutes.FEATURE_FLAG_DETAILS(id));
        onLoading(false);

        if (response.success) {
            onSuccess();
        } else {
            onError(response.message || 'Failed to delete feature flag', response.status);
        }
    }
}

export const featureFlagService = new FeatureFlagService();
export { FeatureFlagService };
