/**
 * Member lookup at the counter — GET /api/users/lookup?email|phone|barcode.
 * Staff identifies a member by one of three keys before attaching them to a
 * counter booking (for points, wallet, and — once the BE supports it — vouchers).
 */

export type LookupKey = "email" | "phone" | "barcode";

export interface MemberMembership {
    currentTier: string;
    totalPoints: number;
    discountPercent: number;
    nextTier: string | null;
    pointsToNextTier: number | null;
}

export interface MemberWallet {
    walletID: number;
    balance: number;
}

/** A voucher the member can apply, returned inline on lookup (same shape as
 *  GET /vouchers/redeemable). */
export interface MemberVoucher {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountValue: number;
    requiredPoints?: number;
    exchangeLimit?: number;
    validFrom?: string;
    validUntil?: string;
    imageUrl?: string | null;
    description?: string;
}

export interface LookedUpMember {
    userID: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatarURL: string | null;
    membership: MemberMembership | null;
    wallet: MemberWallet | null;
    vouchers: MemberVoucher[];
    cinema: unknown | null;
}

export interface UserLookupResponse {
    success: boolean;
    message: string;
    user: LookedUpMember | null;
}
