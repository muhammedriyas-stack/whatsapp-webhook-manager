import api from "./axios.service";
import {
    GeneralApiResponse,
    GeneralApiResponsePagination,
} from "./url.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ClientPlan = "STARTER" | "BASIC" | "PRO";

export interface IMultibot {
    _id: string;

    name: string;
    assistant_id: string;
    apiUrl: string;
    plan: ClientPlan;
    isActive: boolean;
    botType: "DEMO" | "MULTIBOT";

    createdAt: Date;
    updatedAt: Date;
}

/**
 * MUTATIONS
 */

const END_POINT = "/multibot"

//CREATE Client
export const createMultibot = (obj: Partial<IMultibot>) => {
    return api.post<GeneralApiResponse<IMultibot>>(END_POINT, obj);
};

export const useCreateMultibot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMultibot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multibots"] });
        },
    });
};

//UPDATE Client
export const updateMultibot = ({ _id, ...obj }: Partial<IMultibot>) => {
    return api.patch<GeneralApiResponse<IMultibot>>(`${END_POINT}/${_id}`, obj);
};

export const useUpdateMultibot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMultibot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multibots"] });
            queryClient.invalidateQueries({ queryKey: ["multibot"] });
        },
    });
};

//DELETE Client
export const deleteMultibot = (id: string) => {
    return api.delete<GeneralApiResponse<IMultibot>>(`${END_POINT}/${id}`);
};

export const useDeleteMultibot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMultibot,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["multibots"] });
            queryClient.invalidateQueries({ queryKey: ["multibot"] });
        },
    });
};

/**
 * QUERY
 */

//GET ClientS
export const getMultibots = (queryObj: any) => {
    const query = new URLSearchParams(queryObj).toString();
    return api.get<GeneralApiResponsePagination<IMultibot>>(`${END_POINT}?${query}`);
};

export const useGetMultibots = (queryObj: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["multibots", queryObj],
        queryFn: () => getMultibots(queryObj).then((res) => res.data),
        enabled: enabled,
    });
};
//GET Client BY ID
export const getMultibotById = (id: string) => {
    return api.get<GeneralApiResponse<IMultibot>>(`${END_POINT}/${id}`);
};

export const useGetMultibotById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["multibot", id],
        queryFn: () => getMultibotById(id).then((res) => res.data),
        enabled: enabled,
    });
};