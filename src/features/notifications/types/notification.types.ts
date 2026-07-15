export type NotificationType = "system" | "promotion" | "refund" | "payment" | "booking" | "account";

/** One row from GET /api/notifications. */
export interface NotificationItem {
    notificationId: number;
    title: string;
    message: string;
    type: NotificationType;
    eventType: string;
    referenceType: string | null;
    referenceId: number | null;
    actionUrl: string | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationListResponse {
    items: NotificationItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GetNotificationsParams {
    page?: number;
    pageSize?: number;
    isRead?: boolean;
    type?: NotificationType;
    fromDate?: string;
    toDate?: string;
}

export interface UnreadCountResponse {
    count: number;
}

export interface MarkAllReadResponse {
    success: boolean;
    updatedCount: number;
    message: string;
}

export interface DeleteReadResponse {
    success: boolean;
    deletedCount: number;
    message: string;
}
