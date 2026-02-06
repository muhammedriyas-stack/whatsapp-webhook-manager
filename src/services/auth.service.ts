import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axios.service"
import { IUser } from "@/types/user.type";

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

export const useGetProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const { data } = await api.get<IUser>("/auth/me");
            return data;
        },
        retry: false,
    });
};