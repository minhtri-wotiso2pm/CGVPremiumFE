import axiosInstance from "@/services/axios/axiosInstance";
import type {
    Voucher,
    VoucherListResponse,
    GetVouchersParams,
    VoucherFormData,
} from "@/features/vouchers/types/voucher.types";

const normalizeVoucher = (v: Record<string, unknown>): Voucher => ({
    voucherId: Number(v.voucherId ?? 0),
    voucherCode: String(v.voucherCode ?? ""),
    category: String(v.category ?? "general"),
    discountType: String(v.discountType ?? "percent"),
    discountValue: Number(v.discountValue ?? 0),
    minOrderValue: Number(v.minOrderValue ?? 0),
    maxUses: Number(v.maxUses ?? 0),
    usedCount: Number(v.usedCount ?? 0),
    validFrom: String(v.validFrom ?? ""),
    validUntil: String(v.validUntil ?? ""),
    imageUrl: (v.imageUrl ?? null) as string | null,
    description: String(v.description ?? ""),
    isActive: Boolean(v.isActive),
    createdAt: String(v.createdAt ?? ""),
});

export const getVouchersApi = async (params: GetVouchersParams): Promise<VoucherListResponse> => {
    const { data } = await axiosInstance.get("/vouchers", { params });
    const rawItems: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.items ?? []);
    return {
        items: rawItems.map(normalizeVoucher),
        pageIndex: Number(data?.pageIndex ?? 1),
        pageSize: Number(data?.pageSize ?? rawItems.length),
        totalItems: Number(data?.totalItems ?? rawItems.length),
        totalPages: Number(data?.totalPages ?? 1),
    };
};

const buildFormData = (d: VoucherFormData): FormData => {
    const fd = new FormData();
    fd.append("voucherCode", d.voucherCode);
    fd.append("category", d.category);
    fd.append("discountType", d.discountType);
    fd.append("discountValue", String(d.discountValue));
    fd.append("minOrderValue", String(d.minOrderValue));
    fd.append("maxUses", String(d.maxUses));
    fd.append("validFrom", d.validFrom);
    fd.append("validUntil", d.validUntil);
    fd.append("description", d.description ?? "");
    fd.append("isActive", String(d.isActive));
    if (d.image) fd.append("image", d.image);
    return fd;
};

// Note: do not set Content-Type manually — axios adds the multipart boundary.
export const createVoucherApi = async (d: VoucherFormData): Promise<Voucher> => {
    const { data } = await axiosInstance.post("/vouchers", buildFormData(d));
    return normalizeVoucher(data);
};

export const updateVoucherApi = async (voucherId: number, d: VoucherFormData): Promise<Voucher> => {
    const { data } = await axiosInstance.put(`/vouchers/${voucherId}`, buildFormData(d));
    return normalizeVoucher(data);
};

export const deleteVoucherApi = async (voucherId: number): Promise<void> => {
    await axiosInstance.delete(`/vouchers/${voucherId}`);
};
