import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RedeemableVoucher,
    MyVoucher,
    RedeemVoucherResult,
    VoucherRuleDisplay,
} from "@/features/customer/types/loyaltyVoucher.types";

const normalizeVoucherRules = (raw: unknown): VoucherRuleDisplay[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map((r: Record<string, unknown>) => ({
        ruleType: String(r.ruleType ?? ""),
        displayText: String(r.displayText ?? ""),
        ruleValue: String(r.ruleValue ?? ""),
        operator: String(r.operator ?? "="),
    }));
};

const normalizeRedeemable = (v: Record<string, unknown>): RedeemableVoucher => ({
    voucherId: Number(v.voucherId ?? 0),
    voucherCode: String(v.voucherCode ?? ""),
    discountType: String(v.discountType ?? "percent"),
    discountValue: Number(v.discountValue ?? 0),
    minOrderValue: Number(v.minOrderValue ?? 0),
    requiredPoints: Number(v.requiredPoints ?? 0),
    exchangeLimit: Number(v.exchangeLimit ?? 0),
    validFrom: String(v.validFrom ?? ""),
    validUntil: String(v.validUntil ?? ""),
    imageUrl: (v.imageUrl ?? null) as string | null,
    description: String(v.description ?? ""),
    voucherRules: normalizeVoucherRules(v.voucherRules),
});

export const getRedeemableVouchersApi = async (): Promise<RedeemableVoucher[]> => {
    const { data } = await axiosInstance.get("/vouchers/redeemable");
    const raw: Record<string, unknown>[] = Array.isArray(data?.vouchers) ? data.vouchers : [];
    return raw.map(normalizeRedeemable);
};

const normalizeMyVoucher = (v: Record<string, unknown>): MyVoucher => ({
    voucherId: Number(v.voucherId ?? 0),
    voucherCode: String(v.voucherCode ?? ""),
    discountType: String(v.discountType ?? "percent"),
    discountValue: Number(v.discountValue ?? 0),
    minOrderValue: Number(v.minOrderValue ?? 0),
    quantity: Number(v.quantity ?? 1),
    voucherRules: normalizeVoucherRules(v.voucherRules),
    validFrom: String(v.validFrom ?? ""),
    validUntil: String(v.validUntil ?? ""),
    description: String(v.description ?? ""),
    redeemedAt: String(v.redeemedAt ?? ""),
    expiredAt: (v.expiredAt ?? null) as string | null,
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
