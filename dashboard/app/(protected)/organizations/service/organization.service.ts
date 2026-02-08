import APIs from "@/lib/api";
import API from "@/lib/utils/api/request";
import { ServiceCallbacks } from "@/service/types/service.types";
import { OrganizationRequest } from "./types/organization.request.types";
import { CreatedOrganizationData } from "./types/organization.response.types";
import { PaginationParams } from "./types/organization.list.request.types";
import { OrganizationListResponse } from "./types/organization.list.response.types";

class OrganizationService {
    async create(data: OrganizationRequest, {
        onLoading, onSuccess, onError
    }: ServiceCallbacks<CreatedOrganizationData>) {
        onLoading(true);
        const response = await API.post<CreatedOrganizationData>(APIs.orgs.create, data);
        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || "Failed to create organization");
        }
        onLoading(false);
    }

    async list(params: PaginationParams, {
        onLoading, onSuccess, onError
    }: ServiceCallbacks<OrganizationListResponse>) {
        onLoading(true);
        const response = await API.get<OrganizationListResponse>(APIs.orgs.list, params);
        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || "Failed to fetch organizations");
        }
        onLoading(false);
    }
}

export default OrganizationService;
