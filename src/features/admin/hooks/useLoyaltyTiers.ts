import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getLoyaltyTiersApi,
    createLoyaltyTierApi,
    updateLoyaltyTierApi,
    deleteLoyaltyTierApi,
} from "@/services/api/loyaltyTier.service";
import type { LoyaltyTierPayload } from "../types/loyaltyTier.types";
import { LOYALTY_TIER_QUERY_KEY } from "../constants/loyaltyTier.constants";
import { notify } from "@/utils/notify";

const extractMessage = (err: unknown): string | undefined =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

export function useLoyaltyTiers() {
    return useQuery({
        queryKey: [LOYALTY_TIER_QUERY_KEY],
        queryFn: getLoyaltyTiersApi,
        staleTime: 60 * 1000,
    });
}

export function useCreateLoyaltyTier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: LoyaltyTierPayload) => createLoyaltyTierApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LOYALTY_TIER_QUERY_KEY] });
            notify.success("Loyalty tier created", "The tier has been added successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to create", extractMessage(err) ?? "Could not create loyalty tier. The name or point threshold may already be in use.");
        },
    });
}

export function useUpdateLoyaltyTier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: LoyaltyTierPayload }) =>
            updateLoyaltyTierApi(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LOYALTY_TIER_QUERY_KEY] });
            notify.success("Loyalty tier updated", "Changes have been saved successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to update", extractMessage(err) ?? "Could not update loyalty tier. Please try again.");
        },
    });
}

export function useDeleteLoyaltyTier() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteLoyaltyTierApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [LOYALTY_TIER_QUERY_KEY] });
            notify.success("Loyalty tier deleted", "The tier has been removed.");
        },
        onError: (err: unknown) => {
            notify.error("Cannot delete", extractMessage(err) ?? "This loyalty tier is still assigned to one or more users.");
        },
    });
}
