import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { ServiceCallbacks } from "@/service/types/service.types";

import { AuthResponse, User } from "./types/auth.response.types";
import { LoginRequest, SignupRequest } from "./types/auth.request.types";

class AuthService {
    async login(data: LoginRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<AuthResponse>) {
        onLoading(true);
        const response = await API.post<AuthResponse>(APIRoutes.AUTH_LOGIN, {...data, client: "web"});
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Invalid email or password', response.status);
        }
    }

    async signup(data: SignupRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<User>) {
        onLoading(true);
        const response = await API.post<User>(APIRoutes.AUTH_SIGNUP, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Signup failed', response.status);
        }
    }

    async getCurrentUser({ onLoading, onSuccess, onError }: ServiceCallbacks<User>) {
        onLoading(true);
        const response = await API.get<User>(APIRoutes.AUTH_ME);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch user', response.status);
        }
    }
}

export { AuthService };