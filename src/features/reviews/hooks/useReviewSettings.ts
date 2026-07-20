import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReviewSettingsApi, updateReviewSettingsApi } from "@/services/api/review.service";
import type { ReviewRewardSettings } from "../types/review.types";
import { REVIEW_SETTINGS_QUERY_KEY } from "../constants/review.constants";
import { notify } from "@/utils/notify";

const extractMessage = (err: unknown): string | undefined =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

export function useReviewSettings() {
    return useQuery({
        queryKey: [REVIEW_SETTINGS_QUERY_KEY],
        queryFn: getReviewSettingsApi,
        staleTime: 60 * 1000,
    });
}

export function useUpdateReviewSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ReviewRewardSettings) => updateReviewSettingsApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REVIEW_SETTINGS_QUERY_KEY] });
            notify.success("Settings saved", "New reward points apply to reviews created from now on.");
        },
        onError: (err: unknown) => {
            notify.error("Couldn't save settings", extractMessage(err) ?? "Please try again.");
        },
    });
}
