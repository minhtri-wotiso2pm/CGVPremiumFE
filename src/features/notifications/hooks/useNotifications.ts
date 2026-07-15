import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getNotificationsApi,
    getUnreadCountApi,
    getNotificationDetailApi,
    markNotificationReadApi,
    markAllNotificationsReadApi,
    deleteNotificationApi,
    deleteReadNotificationsApi,
} from "@/services/api/notification.service";
import type { GetNotificationsParams } from "../types/notification.types";
import {
    NOTIFICATION_QUERY_KEY,
    UNREAD_COUNT_QUERY_KEY,
    NOTIFICATION_DETAIL_QUERY_KEY,
    UNREAD_COUNT_POLL_MS,
} from "../constants/notification.constants";

export function useNotifications(params: GetNotificationsParams, enabled = true) {
    return useQuery({
        queryKey: [NOTIFICATION_QUERY_KEY, params],
        queryFn: () => getNotificationsApi(params),
        placeholderData: (prev) => prev,
        staleTime: 15_000,
        enabled,
    });
}

/** Polls on a fixed interval — there's no push/WebSocket channel for
 *  notifications yet, so this is how the unread badge stays fresh. */
export function useUnreadCount(enabled = true) {
    return useQuery({
        queryKey: [UNREAD_COUNT_QUERY_KEY],
        queryFn: getUnreadCountApi,
        staleTime: 15_000,
        refetchInterval: UNREAD_COUNT_POLL_MS,
        enabled,
    });
}

export function useNotificationDetail(id: number | null) {
    return useQuery({
        queryKey: [NOTIFICATION_DETAIL_QUERY_KEY, id],
        queryFn: () => getNotificationDetailApi(id as number),
        enabled: id != null,
    });
}

export function useMarkNotificationRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => markNotificationReadApi(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
            qc.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsReadApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
            qc.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
        },
    });
}

export function useDeleteNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteNotificationApi(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
            qc.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
        },
    });
}

export function useDeleteReadNotifications() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteReadNotificationsApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
        },
    });
}
