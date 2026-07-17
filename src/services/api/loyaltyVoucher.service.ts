import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RedeemableVoucher,
    MyVoucher,
    RedeemVoucherResult,
} from "@/features/customer/types/loyaltyVoucher.types";

const normalizeRedeemable = (v: Record<string, unknown>): RedeemableVoucher => ({
    voucherId: Number(v.voucherId ?? 0),
    voucherCode: String(v.voucherCode ?? ""),
    discountType: String(v.discountType ?? "percent"),
    discountValue: Number(v.discountValue ?? 0),
    requiredPoints: Number(v.requiredPoints ?? 0),
    exchangeLimit: Number(v.exchangeLimit ?? 0),
    validFrom: String(v.validFrom ?? ""),
    validUntil: String(v.validUntil ?? ""),
    imageUrl: (v.imageUrl ?? null) as string | null,
    description: String(v.description ?? ""),
});

export const getRedeemableVouchersApi = async (): Promise<RedeemableVoucher[]> => {
    const { data } = await axiosInstance.get("/vouchers/redeemable");
    const raw: Record<string, unknown>[] = Array.isArray(data?.vouchers) ? data.vouchers : [];
    return raw.map(normalizeRedeemable);
};

const normalizeMyVoucher = (v: Record<string, unknown>): MyVoucher => ({
    userVoucherId: Number(v.userVoucherId ?? 0),
    voucherId: Number(v.voucherId ?? 0),
    voucherCode: String(v.voucherCode ?? ""),
    discountType: String(v.discountType ?? "percent"),
    discountValue: Number(v.discountValue ?? 0),
    status: String(v.status ?? "available"),
    redeemedAt: String(v.redeemedAt ?? ""),
    expiredAt: (v.expiredAt ?? null) as string | null,
    usedAt: (v.usedAt ?? null) as string | null,
    imageUrl: (v.imageUrl ?? null) as string | null,
});

export const getMyVouchersApi = async (): Promise<MyVoucher[]> => {
    const { data } = await axiosInstance.get("/vouchers/my-vouchers");
    const raw: Record<string, unknown>[] = Array.isArray(data?.vouchers) ? data.vouchers : [];
    return raw.map(normalizeMyVoucher);
};

export const redeemVoucherApi = async (voucherId: number): Promise<RedeemVoucherResult> => {
    const { data } = await axiosInstance.post("/vouchers/redeem", { voucherId });
    return {
        remainingPoints: Number(data?.remainingPoints ?? 0),
        voucherCode: String(data?.voucherCode ?? ""),
        message: (data?.message ?? null) as string | null,
    };
};
