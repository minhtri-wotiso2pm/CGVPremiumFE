import axiosInstance from "@/services/axios/axiosInstance";
import type { LoyaltyTierItem, LoyaltyTierPayload } from "@/features/admin/types/loyaltyTier.types";

export const getLoyaltyTiersApi = async (): Promise<LoyaltyTierItem[]> => {
    const { data } = await axiosInstance.get("/admin/loyalty-tiers");
    return Array.isArray(data) ? data : (data?.items ?? []);
};

export const createLoyaltyTierApi = async (payload: LoyaltyTierPayload): Promise<LoyaltyTierItem> => {
    const { data } = await axiosInstance.post("/admin/loyalty-tiers", payload);
    return data;
};

export const updateLoyaltyTierApi = async (id: number, payload: LoyaltyTierPayload): Promise<void> => {
    await axiosInstance.put(`/admin/loyalty-tiers/${id}`, payload);
};

export const deleteLoyaltyTierApi = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/loyalty-tiers/${id}`);
};
