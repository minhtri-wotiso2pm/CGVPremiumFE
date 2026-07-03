import axiosInstance from "@/services/axios/axiosInstance";
import type { MembershipInfo, MembershipTier, PointsHistoryEntry } from "@/features/customer/types/membership.types";

export const getMembershipInfoApi = async (): Promise<MembershipInfo> => {
    const { data } = await axiosInstance.get<MembershipInfo>("/membership/me");
    return data;
};

export const getMembershipTiersApi = async (): Promise<MembershipTier[]> => {
    const { data } = await axiosInstance.get<MembershipTier[]>("/membership/tiers");
    return data;
};

export const getPointsHistoryApi = async (): Promise<PointsHistoryEntry[]> => {
    const { data } = await axiosInstance.get<PointsHistoryEntry[]>("/membership/points-history");
    return data;
};
