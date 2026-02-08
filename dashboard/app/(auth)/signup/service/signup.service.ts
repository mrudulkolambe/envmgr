import { ServiceCallbacks } from "@/service/types/service.types";
import { SignupRequest } from "./types/signup.request.types";
import { SignupResponse } from "./types/signup.response.types";
import API from "@/lib/utils/api/request";
import APIs from "@/lib/api";

class SignupService {
    async signup(data: SignupRequest, {
        onLoading, onSuccess, onError
    }: ServiceCallbacks<SignupResponse>) {
        onLoading(true);
        const response = await API.post<SignupResponse>(APIs.auth.signup, data);
        if (response.success && response.data) {
            onSuccess(response.data);
        } else {
            onError(response.message || "Signup failed");
        }
        onLoading(false);
    }
}

export default SignupService;
