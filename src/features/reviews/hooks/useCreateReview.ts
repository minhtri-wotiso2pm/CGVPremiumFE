import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReviewApi } from "@/services/api/review.service";
import type { CreateReviewPayload } from "../types/review.types";
import {
    MOVIE_REVIEWS_QUERY_KEY,
    MOVIE_RATING_SUMMARY_QUERY_KEY,
} from "../constants/review.constants";
import { notify } from "@/utils/notify";

const extractMessage = (err: unknown): string | undefined =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

export function useCreateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateReviewPayload) => createReviewApi(payload),
        onSuccess: (res) => {
            const points = res.data?.rewardPoints ?? 0;
            // Refresh the customer's bookings (hasReviewed flips) and the
            // movie's review list/summary so the new review shows immediately.
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            queryClient.invalidateQueries({ queryKey: [MOVIE_REVIEWS_QUERY_KEY, res.data?.movieId] });
            queryClient.invalidateQueries({ queryKey: [MOVIE_RATING_SUMMARY_QUERY_KEY, res.data?.movieId] });
            notify.success(
                "Thanks for your review!",
                points > 0 ? `You earned +${points} loyalty points.` : "Your review has been posted.",
            );
        },
        onError: (err: unknown) => {
            notify.error("Couldn't post review", extractMessage(err) ?? "Please try again.");
        },
    });
}
