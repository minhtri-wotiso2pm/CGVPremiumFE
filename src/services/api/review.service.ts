import axiosInstance from "@/services/axios/axiosInstance";
import type {
    CreateReviewPayload,
    CreateReviewResponse,
    MovieReviewsResponse,
    AdminReviewListParams,
    AdminReviewListResponse,
    ReviewRewardSettings,
} from "@/features/reviews/types/review.types";

/* ── Customer ── */

/** POST /api/reviews — create a review for a completed booking. */
export const createReviewApi = async (payload: CreateReviewPayload): Promise<CreateReviewResponse> => {
    const { data } = await axiosInstance.post("/reviews", payload);
    return data;
};

/* ── Public ── */

/** GET /api/movies/{movieId}/reviews — paginated, active-only, with summary. */
export const getMovieReviewsApi = async (
    movieId: number,
    page = 1,
    pageSize = 10,
): Promise<MovieReviewsResponse> => {
    const { data } = await axiosInstance.get(`/movies/${movieId}/reviews`, {
        params: { page, pageSize },
    });
    return {
        movieId: Number(data.movieId ?? movieId),
        averageRating: data.averageRating == null ? null : Number(data.averageRating),
        totalReviews: Number(data.totalReviews ?? 0),
        ratingBreakdown: {
            "1": Number(data.ratingBreakdown?.["1"] ?? 0),
            "2": Number(data.ratingBreakdown?.["2"] ?? 0),
            "3": Number(data.ratingBreakdown?.["3"] ?? 0),
            "4": Number(data.ratingBreakdown?.["4"] ?? 0),
            "5": Number(data.ratingBreakdown?.["5"] ?? 0),
        },
        items: Array.isArray(data.items) ? data.items : [],
        page: Number(data.page ?? page),
        pageSize: Number(data.pageSize ?? pageSize),
    };
};

/* ── Admin ── */

/** GET /api/admin/reviews — moderation list with keyword/movie/status filters. */
export const getAdminReviewsApi = async (
    params: AdminReviewListParams,
): Promise<AdminReviewListResponse> => {
    const { data } = await axiosInstance.get("/admin/reviews", { params });
    return {
        items: Array.isArray(data.items) ? data.items : [],
        page: Number(data.page ?? 1),
        pageSize: Number(data.pageSize ?? 10),
        totalItems: Number(data.totalItems ?? 0),
        totalPages: Number(data.totalPages ?? 0),
    };
};

/** PATCH /api/admin/reviews/{id}/hide */
export const hideReviewApi = async (reviewId: number): Promise<{ message: string }> => {
    const { data } = await axiosInstance.patch(`/admin/reviews/${reviewId}/hide`);
    return data;
};

/** PATCH /api/admin/reviews/{id}/unhide */
export const unhideReviewApi = async (reviewId: number): Promise<{ message: string }> => {
    const { data } = await axiosInstance.patch(`/admin/reviews/${reviewId}/unhide`);
    return data;
};

/* ── Reward settings ── */

/** GET /api/admin/review-settings */
export const getReviewSettingsApi = async (): Promise<ReviewRewardSettings> => {
    const { data } = await axiosInstance.get("/admin/review-settings");
    return {
        firstReviewPoints: Number(data.firstReviewPoints ?? 0),
        nextReviewPoints: Number(data.nextReviewPoints ?? 0),
    };
};

/** PUT /api/admin/review-settings */
export const updateReviewSettingsApi = async (
    payload: ReviewRewardSettings,
): Promise<{ message: string }> => {
    const { data } = await axiosInstance.put("/admin/review-settings", payload);
    return data;
};
