export interface BaseAPIResponse<T = any> {
    success: boolean;
    message: string;
    data: T | null;
}

export interface ServiceCallbacks<T = any> {
    onLoading: (loading: boolean) => void;
    onSuccess: (data: T) => void;
    onError: (message: string) => void;
}

export interface ServiceOptions<T = any> extends ServiceCallbacks<T> {
    queryParams?: Record<string, any>;
}
