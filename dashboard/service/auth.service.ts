import API from "@/lib/utils/api/request";
import APIs from "@/lib/api";
import { UserData } from "@/app/(auth)/login/service/types/login.response.types";

class AuthService {
    async me() {
        return await API.get<UserData>(APIs.auth.me);
    }

    async logout() {
        return await API.post(APIs.auth.logout);
    }
}

export const authService = new AuthService();
