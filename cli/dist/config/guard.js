import { getApiUrl } from "./config.js";
export function requireApiConfig() {
    const apiUrl = getApiUrl() || process.env.ENVMGR_API_URL;
    if (!apiUrl) {
        throw new Error("API URL not configured. Please run 'configure' first.");
    }
    return apiUrl;
}
