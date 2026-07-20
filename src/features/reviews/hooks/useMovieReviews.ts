import { useQuery } from "@tanstack/react-query";
import { getMovieReviewsApi } from "@/services/api/review.service";
import {
    MOVIE_REVIEWS_QUERY_KEY,
    MOVIE_RATING_SUMMARY_QUERY_KEY,
    REVIEW_PAGE_SIZE,
} from "../constants/review.constants";

/** Paginated public reviews for a movie (list + summary). */
export function useMovieReviews(movieId: number, page = 1, pageSize = REVIEW_PAGE_SIZE) {
    return useQuery({
        queryKey: [MOVIE_REVIEWS_QUERY_KEY, movieId, page, pageSize],
        queryFn: () => getMovieReviewsApi(movieId, page, pageSize),
        enabled: Number.isFinite(movieId) && movieId > 0,
        staleTime: 30 * 1000,
    });
}

/** Lightweight rating summary (avg + total) for the movie hero badge — a
 *  1-item fetch that reuses the same endpoint without loading a full page. */
export function useMovieRatingSummary(movieId: number) {
    return useQuery({
        queryKey: [MOVIE_RATING_SUMMARY_QUERY_KEY, movieId],
        queryFn: () => getMovieReviewsApi(movieId, 1, 1),
        enabled: Number.isFinite(movieId) && movieId > 0,
        staleTime: 60 * 1000,
        select: (d) => ({ averageRating: d.averageRating, totalReviews: d.totalReviews }),
    });
}
