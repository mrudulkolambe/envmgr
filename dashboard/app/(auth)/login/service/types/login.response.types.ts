export interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    user: UserData;
    sessionId: string;
}
