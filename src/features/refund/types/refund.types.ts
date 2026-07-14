export interface CreateRefundPayload {
    bookingId: number;
    reason: string;
}

export interface Refund {
    refundId: number;
    bookingId: number;
    reason: string;
    refundAmount: number;
    refundStatus: string;
    createdAt: string;
}