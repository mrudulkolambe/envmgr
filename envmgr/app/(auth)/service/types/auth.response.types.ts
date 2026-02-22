export interface User {
    id: string;
    email: string;
    name: string;
    username: string;
}

export interface AuthResponse extends User {
    token: string;
}