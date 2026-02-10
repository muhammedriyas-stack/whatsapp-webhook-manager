import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios.service";
import { GeneralApiResponse } from "./url.service";
import { FlowData, FlowScreen } from "@/types/flow";

export interface IFlow {
    _id: string;
    name: string;
    flowId?: string;
    status: "draft" | "published";
    clientId: any; // Can be string id or populated object
    clientName?: string;
    data: FlowData;
    builder_state?: FlowScreen[];
    isActive: boolean;
    isDraft?: boolean;
    meta_flow_id?: string;
    meta_sync_status?: "SUCCESS" | "FAILED" | "PENDING";
    meta_error_message?: string;
    meta_flow_status?: string;
    createdAt: string;
    updatedAt: string;
}

const END_POINT = "/flow";

// CREATE Flow
export const createFlow = (obj: Partial<IFlow>) => {
    return api.post<GeneralApiResponse<IFlow>>(END_POINT, obj);
};

export const useCreateFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
        },
    });
};

// UPDATE Flow
export const updateFlow = ({ _id, ...obj }: Partial<IFlow>) => {
    return api.patch<GeneralApiResponse<IFlow>>(`${END_POINT}/${_id}`, obj);
};

export const useUpdateFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
            queryClient.invalidateQueries({ queryKey: ["flow"] });
        },
    });
};

// DELETE Flow
export const deleteFlow = (id: string) => {
    return api.delete<GeneralApiResponse<IFlow>>(`${END_POINT}/${id}`);
};

export const useDeleteFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
        },
    });
};

// SYNC Flow
export const syncFlow = (id: string) => {
    return api.post<GeneralApiResponse<IFlow>>(`${END_POINT}/${id}/sync`);
};

export const useSyncFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: syncFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
            queryClient.invalidateQueries({ queryKey: ["flow"] });
        },
    });
};

// PUBLISH Flow
export const publishFlow = (id: string) => {
    return api.post<GeneralApiResponse<IFlow>>(`${END_POINT}/${id}/publish`);
};

export const usePublishFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: publishFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
            queryClient.invalidateQueries({ queryKey: ["flow"] });
        },
    });
};

// DEPRECATE Flow
export const deprecateFlow = (id: string) => {
    return api.post<GeneralApiResponse<IFlow>>(`${END_POINT}/${id}/deprecate`);
};

export const useDeprecateFlow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deprecateFlow,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flows"] });
            queryClient.invalidateQueries({ queryKey: ["flow"] });
        },
    });
};

// GET Flows
export const getFlows = (queryObj?: any) => {
    const query = queryObj ? `?${new URLSearchParams(queryObj).toString()}` : "";
    return api.get<GeneralApiResponse<IFlow[]>>(`${END_POINT}${query}`);
};

export const useGetFlows = (queryObj?: any) => {
    return useQuery({
        queryKey: ["flows", queryObj],
        queryFn: () => getFlows(queryObj).then((res) => res.data),
    });
};

// GET Flow BY ID
export const getFlowById = (id: string) => {
    return api.get<GeneralApiResponse<IFlow>>(`${END_POINT}/${id}`);
};

export const useGetFlowById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["flow", id],
        queryFn: () => getFlowById(id).then((res) => res.data),
        enabled: !!id && enabled,
    });
};

// GET Flow Preview URL
export const getFlowPreviewUrl = (id: string) => {
    return api.get<GeneralApiResponse<any>>(`${END_POINT}/${id}/preview`);
};

export const useGetFlowPreviewUrl = () => {
    return useMutation({
        mutationFn: getFlowPreviewUrl
    });
};
