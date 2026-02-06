import api from "./axios.service";
import { ICreateUser, IUpdateUser, IUser } from "@/types/user.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const END_POINT = "/users";

export const useGetUsers = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const { data } = await api.get<IUser[]>(END_POINT);
            return data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: ICreateUser) => {
            const { data } = await api.post(END_POINT, user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: IUpdateUser) => {
            const { data } = await api.put(`${END_POINT}/${user._id}`, user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`${END_POINT}/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};
