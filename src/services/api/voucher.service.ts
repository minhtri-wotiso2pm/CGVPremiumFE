import axiosInstance from "@/services/axios/axiosInstance";
import type {
    Voucher,
    VoucherListResponse,
    GetVouchersParams,
    VoucherFormData,
    VoucherRule,
    VoucherRuleTypeMetadata,
} from "@/features/vouchers/types/voucher.types";
import { extractRuleOption } from "@/features/vouchers/constants/ruleValueExtractors";

const normalizeRule = (r: Record<string, unknown>): VoucherRule => ({
    ruleType: String(r.ruleType ?? ""),
    ruleValue: String(r.ruleValue ?? ""),
});

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
    imagePublicId: (v.imagePublicId ?? null) as string | null,
    description: String(v.description ?? ""),
    isActive: Boolean(v.isActive),
    createdAt: String(v.createdAt ?? ""),
    rules: Array.isArray(v.rules) ? (v.rules as Record<string, unknown>[]).map(normalizeRule) : [],
    isRedeemable: Boolean(v.isRedeemable),
    requiredPoints: v.requiredPoints == null ? null : Number(v.requiredPoints),
    exchangeLimit: v.exchangeLimit == null ? null : Number(v.exchangeLimit),
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

// Image is now a pre-uploaded URL (see uploadVoucherImageApi) and rules is a nested
// array, so — matching the JSON payloads shown throughout VOUCHER_SYSTEM_ARCHITECTURE.md
// and RULE_TYPES_API.md §7 — voucher create/update goes over JSON, not multipart.
const buildVoucherPayload = (d: VoucherFormData) => ({
    voucherCode: d.voucherCode,
    category: d.category,
    discountType: d.discountType,
    discountValue: d.discountValue,
    minOrderValue: d.minOrderValue,
    maxUses: d.maxUses,
    validFrom: d.validFrom,
    validUntil: d.validUntil,
    description: d.description ?? "",
    isActive: d.isActive,
    imageUrl: d.imageUrl ?? null,
    imagePublicId: d.imagePublicId ?? null,
    rules: d.rules,
    isRedeemable: d.isRedeemable,
    requiredPoints: d.isRedeemable ? (d.requiredPoints ?? null) : null,
    exchangeLimit: d.isRedeemable ? (d.exchangeLimit ?? null) : null,
});

export const createVoucherApi = async (d: VoucherFormData): Promise<Voucher> => {
    const { data } = await axiosInstance.post("/vouchers", buildVoucherPayload(d));
    return normalizeVoucher(data);
};

export const updateVoucherApi = async (voucherId: number, d: VoucherFormData): Promise<Voucher> => {
    const { data } = await axiosInstance.put(`/vouchers/${voucherId}`, buildVoucherPayload(d));
    return normalizeVoucher(data);
};

export const deleteVoucherApi = async (voucherId: number): Promise<void> => {
    await axiosInstance.delete(`/vouchers/${voucherId}`);
};

/** GET /vouchers/rule-types — server-owned registry driving the rule editor UI. Static; safe to cache per session. */
export const getVoucherRuleTypesApi = async (): Promise<VoucherRuleTypeMetadata[]> => {
    const { data } = await axiosInstance.get("/vouchers/rule-types");
    const raw: Record<string, unknown>[] = Array.isArray(data) ? data : [];
    return raw.map((r) => ({
        ruleType: String(r.ruleType ?? ""),
        displayName: String(r.displayName ?? r.ruleType ?? ""),
        inputType: String(r.inputType ?? "text") as VoucherRuleTypeMetadata["inputType"],
        dataSource: (r.dataSource ?? null) as string | null,
        options: Array.isArray(r.options) ? r.options.map(String) : null,
    }));
};

export interface RuleOption {
    value: string;
    label: string;
}

// VITE_API_BASE_URL already ends in `/api`, but `dataSource` from the metadata API is an
// absolute path that also starts with `/api` (e.g. "/api/cinemas") — strip the duplicate
// so we don't request ".../api/api/cinemas".
const stripDuplicateApiPrefix = (path: string): string => path.replace(/^\/api(?=\/|$)/, "");

/** Generic fetch for a rule type's dynamic `dataSource` — the path itself is server-owned, never hardcoded here. */
export const getRuleOptionsApi = async (ruleType: string, dataSource: string): Promise<RuleOption[]> => {
    const { data } = await axiosInstance.get(stripDuplicateApiPrefix(dataSource));
    const raw: Record<string, unknown>[] = Array.isArray(data) ? data : ((data?.items ?? []) as Record<string, unknown>[]);
    return raw.map((item) => extractRuleOption(ruleType, item));
};

export interface VoucherImageUploadResult {
    imageUrl: string;
    imagePublicId: string | null;
}

/** POST /uploads/vouchers/image — dedicated upload, called eagerly on file select (not embedded in the voucher payload). */
export const uploadVoucherImageApi = async (file: File): Promise<VoucherImageUploadResult> => {
    const fd = new FormData();
    fd.append("File", file);
    const { data } = await axiosInstance.post("/uploads/vouchers/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return {
        imageUrl: String(data?.imageUrl ?? data?.url ?? data?.imageURL ?? ""),
        imagePublicId: (data?.imagePublicId ?? data?.publicId ?? data?.imagePublicID ?? null) as string | null,
    };
};
