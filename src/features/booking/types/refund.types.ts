export interface RefundRequestPayload {
    bookingId: number;
    reason: string;
}

export interface RefundRequestResponse {
    success: boolean;
    refundAmount: number;
    walletBalance: number;
    status: string;
}

export type RefundStatus = "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";

export interface RefundHistoryEntry {
    refundId: number;
    bookingId: number;
    bookingCode: string;
    movieTitle: string;
    showtimeStartTime: string;
    cinemaName: string;
    roomName: string;
    refundAmount: number;
    reason: string;
    status: RefundStatus | string;
    requestedAt: string;
    completedAt: string | null;
    processedByName: string | null;
}
