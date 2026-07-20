/** Mirrors the backend CK_Notification_Type check constraint — all 10
 *  values it can emit. Customer-facing events use booking/payment/refund/
 *  promotion/account/system; Manager/Admin/Staff dashboard events add
 *  analytics/report/movie/showtime. Every value below must have a matching
 *  entry in the color/label/icon maps (the Record<> types enforce this). */
export type NotificationType =
    | "system"
    | "promotion"
    | "refund"
    | "payment"
    | "booking"
    | "account"
    | "analytics"
    | "report"
    | "movie"
    | "showtime";

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
