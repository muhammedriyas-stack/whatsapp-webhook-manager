import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios.service";
import { GeneralApiResponse } from "./url.service";


export interface ICommonCredentials {
    _id: string;

    awsRegion: string | null;
    awsAccessKeyId: string | null;
    awsAccessKeySecret: string | null;
    s3BucketName: string | null;
    googleApiKey: string | null;

    assistantApiUrl: string | null;
    automatedAssistantApiUrl: string | null;
    facebookGraphUrl: string | null;
    verifyToken: string | null;

    createdAt: Date;
    updatedAt: Date;
}

const END_POINT = "/settings"

//GET SETTINGS BY ID
export const getSettings = () => {
    return api.get<GeneralApiResponse<ICommonCredentials>>(`${END_POINT}`);
};

export const useGetSettings = (enabled: boolean = true) => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: () => getSettings().then((res) => res?.data?.data),
        enabled: enabled,
    });
};

//UPDATE SETTINGS
export const updateSettings = ({ _id, ...obj }: Partial<ICommonCredentials>) => {
    return api.patch<GeneralApiResponse<ICommonCredentials>>(`${END_POINT}/${_id}`, obj);
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
};
