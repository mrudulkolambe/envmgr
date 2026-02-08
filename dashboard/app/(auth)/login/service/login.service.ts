import { ServiceCallbacks } from "@/service/types/service.types";
import LoginRequest from "./types/login.request.types";
import API from "@/lib/utils/api/request";
import APIs from "@/lib/api";
import { LoginResponse } from "./types/login.response.types";

class LoginService {
    async login(credentials: LoginRequest, {
        onLoading, onSuccess, onError
    }: ServiceCallbacks<LoginResponse>) {
        onLoading(true);
        const response = await API.post<LoginResponse>(APIs.auth.login, credentials);
        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || "Login failed");
        }
        onLoading(false);
    }
}

export default LoginService