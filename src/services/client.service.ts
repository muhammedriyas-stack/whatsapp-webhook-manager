import { MODE_TYPE, PLAN_TYPE } from "@/components/common/constant.common";
import api from "./axios.service";
import {
    GeneralApiResponse,
    GeneralApiResponsePagination,
} from "./url.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export interface IClient {
    _id: string;

    displayName: string;
    phoneNumber: string;
    phoneNumberId: string;

    accessToken: string;
    plan: PLAN_TYPE;

    assistantId: string;
    automated: boolean;

    isActive: boolean;
    mode?: MODE_TYPE;

    whatsappBusinessId: string;
    appId: string;
    secretKey: string;

    webhookUrlProd: string;
    webhookUrlDev: string;

    botEnabled: boolean;

    apiUrl?: string;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * MUTATIONS
 */

const END_POINT = "/client"

//CREATE Client
export const createClient = (obj: Partial<IClient>) => {
    return api.post<GeneralApiResponse<IClient>>(END_POINT, obj);
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });
};

//UPDATE Client
export const updateClient = ({ _id, ...obj }: Partial<IClient>) => {
    return api.patch<GeneralApiResponse<IClient>>(`${END_POINT}/${_id}`, obj);
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client"] });
        },
    });
};

//LA Config
export const LAConfig = (obj: any) => {
    console.log(obj, 'OBJ');
    return api.post<GeneralApiResponse<any>>(`${END_POINT}/${obj?.id}/LAConfig`, obj);
};

export const useLAConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: LAConfig,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client"] });
        },
    });
};

//DELETE Client
export const deleteClient = (id: string) => {
    return api.delete<GeneralApiResponse<IClient>>(`${END_POINT}/${id}`);
};

export const useDeleteClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client"] });
        },
    });
};

/**
 * QUERY
 */

//GET ClientS
export const getClients = (queryObj: any) => {
    const query = new URLSearchParams(queryObj).toString();
    return api.get<GeneralApiResponsePagination<IClient>>(`${END_POINT}?${query}`);
};

export const useGetClients = (queryObj: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["clients", queryObj],
        queryFn: () => getClients(queryObj).then((res) => res.data),
        enabled: enabled,
    });
};
//GET Client BY ID
export const getClientById = (id: string) => {
    return api.get<GeneralApiResponse<IClient>>(`${END_POINT}/${id}`);
};

export const useGetClientById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["client", id],
        queryFn: () => getClientById(id).then((res) => res.data),
        enabled: enabled,
    });
};