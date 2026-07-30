import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMovieReviewDetailApi, getMovieReviewReportsApi } from "@/services/api/review.service";
import {
    MOVIE_REVIEW_DETAIL_QUERY_KEY,
    MOVIE_REVIEW_REPORTS_QUERY_KEY,
} from "../constants/review.constants";
import type {
    MovieReviewDetailParams,
    MovieReviewDetailResponse,
    MovieReviewReportListParams,
    MovieReviewReportListResponse,
} from "../types/review.types";

export function useMovieReviewReports(params: MovieReviewReportListParams) {
    return useQuery<MovieReviewReportListResponse>({
        queryKey: [MOVIE_REVIEW_REPORTS_QUERY_KEY, params],
        queryFn: () => getMovieReviewReportsApi(params),
        placeholderData: keepPreviousData,
        staleTime: 15 * 1000,
    });
}

export function useMovieReviewDetail(movieId: number | null, params: MovieReviewDetailParams, enabled: boolean) {
    return useQuery<MovieReviewDetailResponse>({
        queryKey: [MOVIE_REVIEW_DETAIL_QUERY_KEY, movieId, params],
        queryFn: () => getMovieReviewDetailApi(movieId!, params),
        enabled: enabled && Number.isFinite(movieId) && movieId! > 0,
        staleTime: 15 * 1000,
    });
}
