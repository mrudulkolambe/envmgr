export type Flags = Record<string, boolean>;

export class EnvmgrClient {
    private flags: Flags = {};
    private apiKey: string;
    private apiUrl: string;
    private initialized = false;

    constructor(apiKey: string, apiUrl = "https://envmgr.vercel.app") {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl.replace(/\/$/, "").replace(/\/api$/, "") + "/api";
    }

    async isFeatureEnabled(key: string, defaultValue = false): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/sdk/check?key=${key}`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return defaultValue;
            }

            return data.data.isEnabled;
        } catch (error) {
            console.error(`[Envmgr SDK] Error checking flag "${key}":`, error);
            return defaultValue;
        }
    }

    async init() {
        try {
            const response = await fetch(`${this.apiUrl}/sdk/sync`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to initialize Envmgr");
            }

            this.flags = data.data.flags;
            this.initialized = true;
            return this.flags;
        } catch (error) {
            console.error("[Envmgr SDK] Initialization failed:", error);
            throw error;
        }
    }

    getFlagValue(key: string, defaultValue = false): boolean {
        if (!this.initialized) {
            console.warn(`[Envmgr SDK] Calling getFlagValue("${key}") before initialization.`);
        }
        return this.flags[key] ?? defaultValue;
    }

    getAllFlags(): Flags {
        return { ...this.flags };
    }
}
