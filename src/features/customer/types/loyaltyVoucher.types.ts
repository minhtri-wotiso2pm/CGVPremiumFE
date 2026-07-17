export type MyVoucherStatus = "available" | "used" | "expired" | string;

/** One entry from GET /vouchers/redeemable — a voucher this customer could exchange points for. */
export interface RedeemableVoucher {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    requiredPoints: number;
    exchangeLimit: number;
    validFrom: string;
    validUntil: string;
    imageUrl: string | null;
    description: string;
}

/** One entry from GET /vouchers/my-vouchers — a voucher this customer already owns. */
export interface MyVoucher {
    userVoucherId: number;
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    status: MyVoucherStatus;
    redeemedAt: string;
    expiredAt: string | null;
    usedAt: string | null;
    imageUrl: string | null;
}

/** Response from POST /vouchers/redeem. */
export interface RedeemVoucherResult {
    remainingPoints: number;
    voucherCode: string;
    message: string | null;
}
