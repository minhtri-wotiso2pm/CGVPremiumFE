export type DiscountType = "percent" | "fixed";

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
    description: string;
    isActive: boolean;
    createdAt: string;
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

/** Fields sent as multipart/form-data on create/update. */
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
    image?: File | null;
}

export type VoucherModalType = "create" | "edit" | "delete";
