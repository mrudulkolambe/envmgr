export interface LoginRequest {
    email: string;
    password: string;
    client: "web" | "cli"
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    username: string;
}