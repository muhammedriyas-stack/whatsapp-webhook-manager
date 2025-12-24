import api from "./axios.service";
import { IClient } from "./client.service";
import {
    GeneralApiResponse,
} from "./url.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ClientPlan = "STARTER" | "BASIC" | "PRO";

export interface IOverrideClient {
    _id: string;

    env: string;
    url: string;

    name: string;
    whatsappNumber: string;
    phoneNumberId: string;

    token: string;
    myToken: string;
    plan: ClientPlan;

    assistantId: string;
    automated: boolean;

    isActive: boolean;

    wabaId: string;
    appId: string;
    appSecret: string;

    sessionKey: string;

    webhookUrlProd: string;
    webhookUrlDev: string;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * MUTATIONS
 */

const END_POINT = "/webhook/override"

//UPDATE Client
export const overrideWebhookUrl = (obj: Partial<IOverrideClient>) => {
    return api.post<GeneralApiResponse<IClient>>(`${END_POINT}`, obj);
};

export const useOverrideWebhook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: overrideWebhookUrl,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client"] });
        },
    });
};

export const overrideAllWebhookUrl = (obj: Partial<IOverrideClient>) => {
    return api.post<GeneralApiResponse<IClient>>(`${END_POINT}/all`, obj);
};

export const useOverrideAllWebhook = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: overrideAllWebhookUrl,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client"] });
        },
    });
};