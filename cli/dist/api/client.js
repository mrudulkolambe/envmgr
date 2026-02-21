import { getApiUrl, getToken } from "../config/config.js";
const DEFAULT_BASE_URL = "http://localhost:3000";
function resolveBaseUrl() {
    return (getApiUrl() ||
        process.env.ENVMGR_API_URL ||
        DEFAULT_BASE_URL);
}
export async function apiFetch(path, options = {}) {
    const token = getToken();
    const baseUrl = resolveBaseUrl();
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }
    return data;
}
