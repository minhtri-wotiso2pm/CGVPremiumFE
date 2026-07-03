import axiosInstance from "@/services/axios/axiosInstance";

import type { ProfileResponse, UpdateProfilePayload } from "@/features/customer/types/profile.type";
import type {
    UserProfileResponse,
} from "@/features/customer/types/customer.type";

export const getUserProfileApi =
    async (): Promise<UserProfileResponse> => {

        const response =
            await axiosInstance.get(
                "/user/profile"
            );

        return response.data;
    };

const BASE_URL = "/user/profile";

export const getProfile = async (): Promise<ProfileResponse> => {
    const { data } = await axiosInstance.get<ProfileResponse>(BASE_URL);
    return data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
    const { data } = await axiosInstance.put<ProfileResponse>(BASE_URL, payload);
    return data;
};

export const uploadAvatar = async (file: File): Promise<ProfileResponse> => {
    const form = new FormData();
    form.append("File", file);
    const { data } = await axiosInstance.put<ProfileResponse>(
        `${BASE_URL}/avatar`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
};

export const deleteAvatar = async (): Promise<ProfileResponse> => {
    const { data } = await axiosInstance.delete<ProfileResponse>(`${BASE_URL}/avatar`);
    return data;
};

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const changeOwnPassword = async (payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.put<{ success: boolean; message: string }>("/user/password", payload);
    return data;
};