const REFUND_CUTOFF_MS = 30 * 60 * 1000;

/** Client-side pre-check only — the server re-validates payment/ticket/monthly-limit
 *  rules and is the source of truth. This just avoids showing the button when it
 *  would obviously be rejected (already refunded/cancelled, or too close to showtime). */
export const canRequestRefund = (status: string, startTime: string): boolean => {
    if (status.toLowerCase() !== "paid") return false;
    const showtimeMs = new Date(startTime).getTime();
    if (Number.isNaN(showtimeMs)) return false;
    return showtimeMs - Date.now() > REFUND_CUTOFF_MS;
};

/** Whether the customer's membership-tier refund quota still has room —
 *  `null` means the quota hasn't loaded yet (don't block on it). */
export const hasRefundQuotaLeft = (refundsRemaining: number | null): boolean =>
    refundsRemaining == null || refundsRemaining > 0;
