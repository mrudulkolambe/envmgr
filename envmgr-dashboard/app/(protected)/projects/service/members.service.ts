import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";
import { ProjectMember, ProjectInvite, PaginatedMembers } from "./types/member.response.types";

class ProjectMemberService {
    async getPaginatedMembers(
        projectId: string,
        params: { page: number; limit: number; search: string },
        { onLoading, onSuccess, onError }: ServiceCallbacks<PaginatedMembers>
    ) {
        onLoading(true);
        const response = await API.get<PaginatedMembers>(APIRoutes.PROJECT_MEMBERS(projectId), params);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch members', response.status);
        }
    }

    async inviteMember(
        projectId: string,
        data: { email: string; access: 'VIEW' | 'EDIT' },
        { onLoading, onSuccess, onError }: ServiceCallbacks<ProjectInvite>
    ) {
        onLoading(true);
        const response = await API.post<ProjectInvite>(APIRoutes.PROJECT_INVITES(projectId), data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to invite member', response.status);
        }
    }

    async removeMember(
        projectId: string,
        memberId: string,
        { onLoading, onSuccess, onError }: ServiceCallbacks<any>
    ) {
        onLoading(true);
        const response = await API.delete(`${APIRoutes.PROJECT_MEMBERS(projectId)}/${memberId}`);
        onLoading(false);

        if (response.success) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to remove member', response.status);
        }
    }

    async cancelInvite(
        projectId: string,
        inviteId: string,
        { onLoading, onSuccess, onError }: ServiceCallbacks<any>
    ) {
        onLoading(true);
        const response = await API.delete(`${APIRoutes.PROJECT_INVITES(projectId)}/${inviteId}`);
        onLoading(false);

        if (response.success) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to cancel invite', response.status);
        }
    }

    async updateMemberAccess(
        projectId: string,
        memberId: string,
        access: 'VIEW' | 'EDIT',
        { onLoading, onSuccess, onError }: ServiceCallbacks<any>
    ) {
        onLoading(true);
        const response = await API.patch(`${APIRoutes.PROJECT_MEMBERS(projectId)}/${memberId}`, { access });
        onLoading(false);

        if (response.success) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update member access', response.status);
        }
    }

    async updateInviteAccess(
        projectId: string,
        inviteId: string,
        access: 'VIEW' | 'EDIT',
        { onLoading, onSuccess, onError }: ServiceCallbacks<any>
    ) {
        onLoading(true);
        const response = await API.patch(`${APIRoutes.PROJECT_INVITES(projectId)}/${inviteId}`, { access });
        onLoading(false);

        if (response.success) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to update invitation access', response.status);
        }
    }
}

export { ProjectMemberService };
