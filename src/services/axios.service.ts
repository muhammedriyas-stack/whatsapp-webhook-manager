import axios from "axios";
import { API_FULL_BASE_URL } from "./url.service";

const api = axios.create({
    baseURL: API_FULL_BASE_URL,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("user_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem("user_token");

            // Avoid loop if already on /auth
            if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
