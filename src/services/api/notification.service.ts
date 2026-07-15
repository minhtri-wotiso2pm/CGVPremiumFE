import axiosInstance from "@/services/axios/axiosInstance";
import type {
    NotificationListResponse,
    NotificationItem,
    GetNotificationsParams,
    UnreadCountResponse,
    MarkAllReadResponse,
    DeleteReadResponse,
} from "@/features/notifications/types/notification.types";

export const getNotificationsApi = async (
    params: GetNotificationsParams,
): Promise<NotificationListResponse> => {
    const { data } = await axiosInstance.get("/notifications", { params });
    return data;
};

export const getUnreadCountApi = async (): Promise<UnreadCountResponse> => {
    const { data } = await axiosInstance.get("/notifications/unread-count");
    return data;
};

export const getNotificationDetailApi = async (id: number): Promise<NotificationItem> => {
    const { data } = await axiosInstance.get(`/notifications/${id}`);
    return data;
};

export const markNotificationReadApi = async (id: number): Promise<void> => {
    await axiosInstance.put(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = async (): Promise<MarkAllReadResponse> => {
    const { data } = await axiosInstance.put("/notifications/read-all");
    return data;
};

export const deleteNotificationApi = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
};

export const deleteReadNotificationsApi = async (): Promise<DeleteReadResponse> => {
    const { data } = await axiosInstance.delete("/notifications/read");
    return data;
};
