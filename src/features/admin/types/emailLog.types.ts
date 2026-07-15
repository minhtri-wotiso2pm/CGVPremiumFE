export type DeliveryStatus = "queued" | "sending" | "sent" | "failed" | "skipped";

/** One row from GET /api/admin/email-logs. */
export interface EmailLogRow {
    emailLogId: number;
    userId: number | null;
    recipientEmail: string;
    subject: string;
    eventType: string;
    templateName: string;
    deliveryStatus: DeliveryStatus;
    retryCount: number;
    errorMessage: string | null;
    providerMessageId: string | null;
    sentAt: string | null;
    createdAt: string;
}

export interface EmailLogListResponse {
    items: EmailLogRow[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GetEmailLogsParams {
    userId?: number;
    recipientEmail?: string;
    eventType?: string;
    deliveryStatus?: DeliveryStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}
