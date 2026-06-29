import axiosInstance from "@/services/axios/axiosInstance";
import type {
    UserListResponse,
    GetUsersParams,
    CreateUserPayload,
    UpdateUserPayload,
    ChangeRolePayload,
    ChangeStatusPayload,
    ChangePasswordPayload,
} from "@/features/admin/types/user.types";

export const getUsersApi = async (params: GetUsersParams): Promise<UserListResponse> => {
    const { data } = await axiosInstance.get("/admin/users", { params });
    return data;
};

export const createUserApi = async (payload: CreateUserPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post("/admin/users", payload);
    return data;
};

export const updateUserApi = async (userId: number, payload: UpdateUserPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.put(`/admin/users/${userId}`, payload);
    return data;
};

export const changeRoleApi = async (userId: number, payload: ChangeRolePayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.patch(`/admin/users/${userId}/role`, payload);
    return data;
};

export const changeStatusApi = async (userId: number, payload: ChangeStatusPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.patch(`/admin/users/${userId}/status`, payload);
    return data;
};

export const changePasswordApi = async (userId: number, payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const { data } = await axiosInstance.patch(`/admin/users/${userId}/password`, payload);
    return data;
};

export const deleteUserApi = async (userId: number): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
    return data;
};
