export interface BaseAPIResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    status: number;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

export type OnLoading = (loading: boolean) => void;
export type OnSuccess<T> = (data: T) => void;
export type OnError = (message: string, status: number) => void;

export interface ServiceCallbacks<T> {
    onLoading: OnLoading;
    onSuccess: OnSuccess<T>;
    onError: OnError;
}
