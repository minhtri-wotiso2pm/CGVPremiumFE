/* ══════════════════════════════════════════════════════════════
   Review & Rating — shared types
   Mirrors the BE contract for:
   - POST   /api/reviews                        (create)
   - GET    /api/movies/{movieId}/reviews       (public list)
   - GET    /api/admin/reviews                  (admin list)
   - PATCH  /api/admin/reviews/{id}/hide|unhide
   - GET/PUT /api/admin/review-settings
══════════════════════════════════════════════════════════════ */

/** A 1–5 star rating. */
export type StarValue = 1 | 2 | 3 | 4 | 5;

/* ── Create review (API 1) ── */
export interface CreateReviewPayload {
    bookingId: number;
    rating: number;
    comment?: string;
}

export interface CreateReviewData {
    reviewId: number;
    movieId: number;
    rating: number;
    comment: string;
    rewardPoints: number;
}

export interface CreateReviewResponse {
    success: boolean;
    message: string;
    data: CreateReviewData;
}

/* ── Public movie reviews (API 2) ── */
export interface ReviewUser {
    id: number;
    name: string;
    avatarUrl: string | null;
}

export interface MovieReviewItem {
    reviewId: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: ReviewUser;
}

/** Count of reviews per star value. Keys are "1".."5". */
export type RatingBreakdown = Record<"1" | "2" | "3" | "4" | "5", number>;

export interface MovieReviewsResponse {
    movieId: number;
    averageRating: number | null;
    totalReviews: number;
    ratingBreakdown: RatingBreakdown;
    items: MovieReviewItem[];
    page: number;
    pageSize: number;
}

/** Sort options for the public review list (client-side over the fetched page). */
export type ReviewSort = "newest" | "highest" | "lowest";

/* ── Admin review list (API 5) ── */
export type AdminReviewStatus = "active" | "hidden" | "all";

export interface AdminReviewItem {
    reviewId: number;
    movieId: number;
    movieTitle: string;
    userId: number;
    customerName: string;
    customerAvatar: string | null;
    rating: number;
    comment: string;
    isHidden: boolean;
    createdAt: string;
    hiddenAt: string | null;
}

export interface AdminReviewListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    movieId?: number;
    status?: AdminReviewStatus;
}

export interface AdminReviewListResponse {
    items: AdminReviewItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/* ── Reward settings (API 3/4) ── */
export interface ReviewRewardSettings {
    firstReviewPoints: number;
    nextReviewPoints: number;
}
