export type DiscountType = "percent" | "fixed";

/** UI control to render for a rule type, driven by GET /vouchers/rule-types. */
export type VoucherRuleInputType = "select" | "multiselect" | "text" | "number";

/** One entry from GET /vouchers/rule-types — describes how to render/populate a rule's editor. */
export interface VoucherRuleTypeMetadata {
    ruleType: string;
    displayName: string;
    inputType: VoucherRuleInputType;
    /** Absolute API path to fetch dynamic options from. Mutually exclusive with `options`. */
    dataSource: string | null;
    /** Static, wire-stable option values. Mutually exclusive with `dataSource`. */
    options: string[] | null;
}

/** A single voucher restriction, keyed by a `ruleType` from VoucherRuleTypeMetadata. */
export interface VoucherRule {
    ruleType: string;
    ruleValue: string;
}

export interface Voucher {
    voucherId: number;
    voucherCode: string;
    category: string;
    discountType: DiscountType | string;
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    usedCount: number;
    validFrom: string;
    validUntil: string;
    imageUrl: string | null;
    imagePublicId: string | null;
    description: string;
    isActive: boolean;
    createdAt: string;
    rules: VoucherRule[];
    /** false = public voucher (always available); true = loyalty voucher (must be redeemed with points first). */
    isRedeemable: boolean;
    /** Points cost per redemption. Only meaningful when isRedeemable=true. */
    requiredPoints: number | null;
    /** Max redemptions per user. Only meaningful when isRedeemable=true. */
    exchangeLimit: number | null;
}

export interface VoucherListResponse {
    items: Voucher[];
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GetVouchersParams {
    pageIndex?: number;
    pageSize?: number;
    searchKeyword?: string;
}

/** Fields sent as JSON on create/update. */
export interface VoucherFormData {
    voucherCode: string;
    category: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    maxUses: number;
    validFrom: string; // ISO 8601 with +07:00
    validUntil: string;
    description: string;
    isActive: boolean;
    /** CDN URL + public ID already returned by POST /uploads/vouchers/image — never a raw File. */
    imageUrl?: string | null;
    imagePublicId?: string | null;
    rules: VoucherRule[];
    isRedeemable: boolean;
    requiredPoints?: number | null;
    exchangeLimit?: number | null;
}

export type VoucherModalType = "create" | "edit" | "delete";
