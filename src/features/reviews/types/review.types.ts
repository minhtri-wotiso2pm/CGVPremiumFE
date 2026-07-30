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

/* ── Admin movie review reports (API 1/2) ── */
export interface MovieReviewReportItem {
    movieId: number;
    movieTitle: string;
    posterUrl: string | null;
    totalReviews: number;
    averageRating: number | null;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
    latestReviewDate: string | null;
}

export type MovieReviewReportSortBy = "movieName" | "newestReview" | "highestRating" | "lowestRating" | "mostReviews";
export type MovieReviewReportSortDir = "asc" | "desc";

export interface MovieReviewReportListParams {
    searchTitle?: string;
    fromDate?: string;
    toDate?: string;
    minAverageRating?: number;
    maxAverageRating?: number;
    sortBy?: MovieReviewReportSortBy;
    sortDir?: MovieReviewReportSortDir;
    page?: number;
    pageSize?: number;
}

export interface MovieReviewReportListResponse {
    items: MovieReviewReportItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface MovieReviewDetailMovie {
    movieId: number;
    movieTitle: string;
    posterUrl: string | null;
}

export interface MovieReviewDetailStatistics {
    averageRating: number | null;
    totalReviews: number;
}

export interface MovieReviewDetailReviewItem {
    reviewId: number;
    userId: number;
    userName: string;
    avatar: string | null;
    bookingId: number;
    rating: number;
    comment: string;
    reviewDate: string;
    isHidden?: boolean;
}

export interface MovieReviewDetailResponse {
    movie: MovieReviewDetailMovie;
    statistics: MovieReviewDetailStatistics;
    ratingBreakdown: RatingBreakdown;
    reviews: MovieReviewDetailReviewItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface MovieReviewDetailParams {
    fromDate?: string;
    toDate?: string;
    minRating?: number;
    maxRating?: number;
    page?: number;
    pageSize?: number;
}

/* ── Reward settings (API 3/4) ── */
export interface ReviewRewardSettings {
    firstReviewPoints: number;
    nextReviewPoints: number;
}
