import { AUTH_TOKEN_KEY } from "@/lib/constants/auth";

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) return token;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === AUTH_TOKEN_KEY) return value;
    }

    return null;
};

export const setToken = (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;
};

export const removeToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
};
