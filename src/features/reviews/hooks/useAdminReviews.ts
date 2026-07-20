import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
    getAdminReviewsApi,
    hideReviewApi,
    unhideReviewApi,
} from "@/services/api/review.service";
import type { AdminReviewListParams } from "../types/review.types";
import { ADMIN_REVIEWS_QUERY_KEY } from "../constants/review.constants";
import { notify } from "@/utils/notify";

const extractMessage = (err: unknown): string | undefined =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

export function useAdminReviews(params: AdminReviewListParams) {
    return useQuery({
        queryKey: [ADMIN_REVIEWS_QUERY_KEY, params],
        queryFn: () => getAdminReviewsApi(params),
        placeholderData: keepPreviousData,
        staleTime: 15 * 1000,
    });
}

export function useHideReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: number) => hideReviewApi(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_REVIEWS_QUERY_KEY] });
            notify.success("Review hidden", "It no longer appears on the movie page.");
        },
        onError: (err: unknown) => {
            notify.error("Couldn't hide review", extractMessage(err) ?? "Please try again.");
        },
    });
}

export function useUnhideReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reviewId: number) => unhideReviewApi(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_REVIEWS_QUERY_KEY] });
            notify.success("Review restored", "It is visible on the movie page again.");
        },
        onError: (err: unknown) => {
            notify.error("Couldn't restore review", extractMessage(err) ?? "Please try again.");
        },
    });
}
