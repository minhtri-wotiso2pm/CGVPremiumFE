import axiosInstance from "@/services/axios/axiosInstance";

import type {
    UserProfileResponse,
} from "@/features/customer/types/customer.type";

export const getUserProfileApi = async (
): Promise<UserProfileResponse> => {
    const response = await axiosInstance.get(
        "/user/profile"
    );

    return response.data;
};