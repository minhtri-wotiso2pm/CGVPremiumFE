export type MovieMgmtStatus = "now_showing" | "coming_soon" | "ended";

export const MOVIE_STATUS_LABELS: Record<string, string> = {
    now_showing: "Đang chiếu",
    coming_soon: "Sắp chiếu",
    ended:       "Đã kết thúc",
};

export const AGE_RATING_OPTIONS = [
    { value: "P",   label: "P — Mọi lứa tuổi" },
    { value: "K",   label: "K — Dưới 13 (có phụ huynh)" },
    { value: "T13", label: "T13 — Từ 13 tuổi" },
    { value: "T16", label: "T16 — Từ 16 tuổi" },
    { value: "T18", label: "T18 — Từ 18 tuổi" },
    { value: "C18", label: "C18 — Chỉ 18+ (hạn chế)" },
];

export const MOVIE_STATUS_OPTIONS = [
    { value: "now_showing", label: "Đang chiếu" },
    { value: "coming_soon", label: "Sắp chiếu" },
    { value: "ended",       label: "Đã kết thúc" },
];

export const MOVIE_STATUS_FILTER_OPTIONS = [
    { value: "",            label: "Tất cả trạng thái" },
    { value: "now_showing", label: "Đang chiếu" },
    { value: "coming_soon", label: "Sắp chiếu" },
    { value: "ended",       label: "Đã kết thúc" },
];

/* ── List item (from GET /api/movie paged) ── */
export interface MovieListItem {
    movieId: number;
    title: string;
    status: string;
    genres?: string[];
    ageRating?: string;
    posterUrl?: string | null;
    durationMinutes?: number;
}

export interface MovieListResponse {
    items: MovieListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

/* ── Full detail (from GET /api/movie/:id) ── */
export interface MovieMgmtDetail {
    movieId: number;
    title: string;
    genres: string[];
    ageRating: string;
    director: string;
    cast: string;
    synopsis: string;
    durationMinutes: number;
    status: string;
    showingFromDate: string;
    showingToDate: string;
    posterUrl: string | null;
    posterPublicId: string | null;
    trailerUrl: string | null;
}

/* ── Create/Update payloads ── */
export interface CreateMoviePayload {
    title: string;
    genres: string[];
    ageRating: string;
    director: string;
    cast: string;
    synopsis: string;
    durationMinutes: number;
    showingFromDate: string;
    showingToDate: string;
    posterUrl: string | null;
    posterPublicId: string | null;
    trailerUrl: string | null;
}

export interface UpdateMoviePayload extends CreateMoviePayload {
    status: string;
}

/* ── Genre ── */
export interface Genre {
    genreId: number;
    genreName: string;
}

export type MovieModalType = "create" | "edit" | "delete";
