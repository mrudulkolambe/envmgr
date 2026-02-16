import API from "@/lib/api";
import { APIRoutes } from "@/lib/route";
import { AuthValidator } from "@/lib/validators/auth";
import { ServiceCallbacks } from "@/service/types/service.types";
import { z } from "zod";

type LoginRequest = z.infer<typeof AuthValidator.loginSchema>;
type SignupRequest = z.infer<typeof AuthValidator.signupSchema>;

interface AuthResponse {
    id: string;
    email: string;
    auth_token: string;
}

class AuthService {
    async login(data: LoginRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<AuthResponse>) {
        onLoading(true);
        const response = await API.post<AuthResponse>(APIRoutes.AUTH_LOGIN, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Invalid email or password', response.status);
        }
    }

    async signup(data: SignupRequest, { onLoading, onSuccess, onError }: ServiceCallbacks<AuthResponse>) {
        onLoading(true);
        const response = await API.post<AuthResponse>(APIRoutes.AUTH_SIGNUP, data);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Signup failed', response.status);
        }
    }

    async getCurrentUser({ onLoading, onSuccess, onError }: ServiceCallbacks<any>) {
        onLoading(true);
        const response = await API.get<any>(APIRoutes.AUTH_ME);
        onLoading(false);

        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || 'Failed to fetch user', response.status);
        }
    }
}

export { AuthService };