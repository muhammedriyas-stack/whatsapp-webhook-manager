export const baseUrl = import.meta.env.VITE_API_URL;
export const API_FULL_BASE_URL = `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_API_VERSION}/api`;

export type GeneralApiResponse<T = unknown> = {
    message: string;
    data: T;
};

export type GeneralApiResponsePagination<T = unknown> = {
    message: string;
    data: T[];
    total: number;
};