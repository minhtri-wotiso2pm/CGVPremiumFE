import { useQuery } from "@tanstack/react-query";
import {
    getMembershipInfoApi,
    getMembershipTiersApi,
    getPointsHistoryApi,
} from "@/services/api/membership.service";
import type { PointsHistoryEntry } from "../types/membership.types";

export const MEMBERSHIP_INFO_KEY = ["customer", "membership", "info"] as const;
export const MEMBERSHIP_TIERS_KEY = ["customer", "membership", "tiers"] as const;
export const POINTS_HISTORY_KEY = ["customer", "membership", "history"] as const;

export function useMembershipInfo() {
    return useQuery({
        queryKey: MEMBERSHIP_INFO_KEY,
        queryFn: getMembershipInfoApi,
        staleTime: 60_000,
    });
}

export function useMembershipTiers() {
    return useQuery({
        queryKey: MEMBERSHIP_TIERS_KEY,
        queryFn: getMembershipTiersApi,
        staleTime: 5 * 60_000,
    });
}

export function usePointsHistory() {
    return useQuery<PointsHistoryEntry[]>({
        queryKey: POINTS_HISTORY_KEY,
        queryFn: getPointsHistoryApi,
        staleTime: 30_000,
    });
}
