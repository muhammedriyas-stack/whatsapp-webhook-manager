import { useMutation } from "@tanstack/react-query";
import api from "./axios.service"

export const login = async (body: { email: string, password: string }) => {
    return await api.post("/auth", body)
};

export const useLogin = () => {
    return useMutation({
        mutationFn: login,
        onSuccess: (res) => {
            localStorage.setItem("user_token", res?.data?.accessToken);
        },
    });
};