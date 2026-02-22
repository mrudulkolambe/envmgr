import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { getToken } from "./token";
import { BaseAPIResponse } from "@/service/types/service.types";

interface APIError {
    success: false;
    message: string;
    status: number;
    data: null;
}

type RequestParams = Record<string, any>;
type RequestBody = Record<string, any> | any[];

class API {
    private static instance: AxiosInstance;

    private static getInstance(): AxiosInstance {
        if (!this.instance) {
            this.instance = axios.create({
                baseURL: '/api',
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

    private static handleError(error: unknown): APIError {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<any>;
            const responseData = axiosError.response?.data;
            return {
                success: false,
                message: responseData?.message || axiosError.message || 'An error occurred',
                status: responseData?.status || axiosError.response?.status || 500,
                data: null,
            };
        }
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            status: 500,
            data: null,
        };
    }

    static async get<T = any>(url: string, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.get<any>(url, { params });
            const responseData = response.data;
            return {
                success: responseData?.success ?? true,
                message: responseData?.message ?? "success",
                data: responseData?.data ?? responseData,
                status: responseData?.status || response.status,
                pagination: responseData?.pagination
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async post<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.post<any>(url, data, { params });
            const responseData = response.data;
            return {
                success: responseData?.success ?? true,
                message: responseData?.message ?? "success",
                data: responseData?.data ?? responseData,
                status: responseData?.status || response.status,
                pagination: responseData?.pagination
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async put<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.put<any>(url, data, { params });
            const responseData = response.data;
            return {
                success: responseData?.success ?? true,
                message: responseData?.message ?? "success",
                data: responseData?.data ?? responseData,
                status: responseData?.status || response.status,
                pagination: responseData?.pagination
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async patch<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const response = await instance.patch<any>(url, data, { params });
            const responseData = response.data;
            return {
                success: responseData?.success ?? true,
                message: responseData?.message ?? "success",
                data: responseData?.data ?? responseData,
                status: responseData?.status || response.status,
                pagination: responseData?.pagination
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async delete<T = any>(url: string, data?: RequestBody, params?: RequestParams): Promise<BaseAPIResponse<T>> {
        try {
            const instance = this.getInstance();
            const config: AxiosRequestConfig = { params };
            if (data) {
                config.data = data;
            }
            const response = await instance.delete<any>(url, config);
            const responseData = response.data;
            return {
                success: responseData?.success ?? true,
                message: responseData?.message ?? "success",
                data: responseData?.data ?? responseData,
                status: responseData?.status || response.status,
                pagination: responseData?.pagination
            };
        } catch (error) {
            return this.handleError(error);
        }
    }
}

export default API;
export type { APIError, RequestParams, RequestBody };
