import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { getToken } from "./token";
import { BaseAPIResponse } from "@/service/types/service.types";

interface APIError {
    success: false;
    message: string;
    status?: number;
    data: null;
}

type RequestParams = Record<string, string | number | boolean | undefined | null | Record<string, string | number | boolean | undefined | null>>;
type RequestBody = Record<string, any> | any[];

class API {
    private static instance: AxiosInstance;

    private static getInstance(): AxiosInstance {
        if (!this.instance) {
            this.instance = axios.create({
                baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            this.instance.interceptors.request.use(
                (config) => {
                    const token = getToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }

                    const testMode = typeof window !== 'undefined'
                        ? localStorage.getItem('testMode')
                        : null;
                    const isTestMode = testMode !== null ? testMode === 'true' : true;
                    config.headers['paynex-mode'] = isTestMode ? 'Test' : 'Live';

                    if (config.data instanceof FormData) {
                        if (config.headers) {
                            delete (config.headers as any)['Content-Type'];
                        }
                    }
                    return config;
                },
                (error) => {
                    return Promise.reject(error);
                }
            );

            this.instance.interceptors.response.use(
                (response) => response,
                (error) => {
                    return Promise.reject(error);
                }
            );
        }
        return this.instance;
    }

    private static formatResponse<T>(serverData: any): BaseAPIResponse<T> {
        const success = !!(serverData?.success);
        return {
            success,
            message: serverData?.message || serverData?.error || (success ? "success" : "Operation failed"),
            data: success ? (serverData?.data ?? serverData) : null
        };
    }

    private static handleError(error: unknown): APIError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const serverData = axiosError.response?.data as any;
            return {
                success: false,
                message: serverData?.error || serverData?.message || axiosError.message || 'An error occurred',
                data: null,
            };
        }
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            data: null,
        };
    }

    static async get<T = any>(url: string, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.get(url, { params });
            return this.formatResponse<T>(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async post<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.post(url, data, { params });
            return this.formatResponse<T>(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async put<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.put(url, data, { params });
            return this.formatResponse<T>(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async patch<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.patch(url, data, { params });
            return this.formatResponse<T>(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async delete<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const config: AxiosRequestConfig = { params };
            if (data) config.data = data;
            const response = await instance.delete(url, config);
            return this.formatResponse<T>(response.data);
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export default API;
export type { APIError, RequestParams, RequestBody };
