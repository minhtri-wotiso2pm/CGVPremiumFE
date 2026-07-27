/** One restriction on a voucher, already rendered server-side into display
 *  text — no client-side ID→name resolution needed for these two endpoints.
 *  `ruleValue`/`operator` are kept so the checkout picker can evaluate
 *  eligibility (cinema, day-of-week, apply scope) against the current order. */
export interface VoucherRuleDisplay {
    ruleType: string;
    displayText: string;
    ruleValue: string;
    operator: string;
}

/**
 * Minimal shape RedeemConfirmModal actually needs. Both `RedeemableVoucher`
 * (this file) and the admin-shaped `Voucher` (`@/features/vouchers/types/voucher.types`,
 * used on the public Promotions page) satisfy this structurally — no adapter
 * needed to reuse the same confirm modal in both places.
 */
export interface RedeemableVoucherLike {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    requiredPoints: number;
}

/** One entry from GET /vouchers/redeemable — a voucher this customer could exchange points for. */
export interface RedeemableVoucher {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    requiredPoints: number;
    exchangeLimit: number;
    validFrom: string;
    validUntil: string;
    imageUrl: string | null;
    description: string;
    voucherRules: VoucherRuleDisplay[];
}

/**
 * One entry from GET /vouchers/my-vouchers — grouped by voucher code. The
 * backend only returns vouchers with at least one still-usable (Available)
 * copy, and collapses duplicates into a single row with a `quantity` count —
 * there is no more one-row-per-instance `userVoucherId`/`status` to key or
 * filter on, since anything Used/Expired is simply omitted server-side.
 */
export interface MyVoucher {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    quantity: number;
    voucherRules: VoucherRuleDisplay[];
    validFrom: string;
    validUntil: string;
    description: string;
    redeemedAt: string;
    expiredAt: string | null;
    imageUrl: string | null;
}

/** Response from POST /vouchers/redeem. */
export interface RedeemVoucherResult {
    remainingPoints: number;
    voucherCode: string;
    message: string | null;
}
