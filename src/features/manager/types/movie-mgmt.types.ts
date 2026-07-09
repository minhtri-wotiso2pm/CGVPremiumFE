export type MovieMgmtStatus = "now_showing" | "coming_soon" | "ended";

export const MOVIE_STATUS_LABELS: Record<string, string> = {
    now_showing: "Now Showing",
    coming_soon: "Coming Soon",
    ended:       "Ended",
};

export const AGE_RATING_OPTIONS = [
    { value: "P",   label: "P — All ages" },
    { value: "K",   label: "K — Under 13 (parental guidance)" },
    { value: "T13", label: "T13 — Age 13+" },
    { value: "T16", label: "T16 — Age 16+" },
    { value: "T18", label: "T18 — Age 18+" },
    { value: "C18", label: "C18 — 18+ only (restricted)" },
];

export const MOVIE_STATUS_OPTIONS = [
    { value: "now_showing", label: "Now Showing" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "ended",       label: "Ended" },
];

export const MOVIE_STATUS_FILTER_OPTIONS = [
    { value: "",            label: "All Statuses" },
    { value: "now_showing", label: "Now Showing" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "ended",       label: "Ended" },
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
