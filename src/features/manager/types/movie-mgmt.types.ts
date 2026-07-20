import type { PersonRef } from "@/features/persons/types/person.types";

export type MovieMgmtStatus = "now_showing" | "coming_soon" | "ended";

export const MOVIE_STATUS_LABELS: Record<string, string> = {
    now_showing: "Now Showing",
    coming_soon: "Coming Soon",
    ended: "Ended",
};

/** Compact color meta for movie-status pills (dot + tinted background). */
export const MOVIE_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    now_showing: { label: "Now Showing", color: "#1B9E4B", bg: "rgba(34,197,94,0.12)" },
    coming_soon: { label: "Coming Soon", color: "#C2620A", bg: "rgba(245,158,11,0.14)" },
    ended: { label: "Ended", color: "#6b7280", bg: "rgba(0,0,0,0.06)" },
};

/** Statuses a showtime may be scheduled for (excludes ended movies). */
export const SCHEDULABLE_MOVIE_STATUSES = ["now_showing", "coming_soon"];

export const AGE_RATING_OPTIONS = [
    { value: "P", label: "P — All ages" },
    { value: "K", label: "K — Under 13 (parental guidance)" },
    { value: "T13", label: "T13 — Age 13+" },
    { value: "T16", label: "T16 — Age 16+" },
    { value: "T18", label: "T18 — Age 18+" },
    { value: "C18", label: "C18 — 18+ only (restricted)" },
];

export const MOVIE_STATUS_OPTIONS = [
    { value: "now_showing", label: "Now Showing" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "ended", label: "Ended" },
];

export const MOVIE_STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Statuses" },
    { value: "now_showing", label: "Now Showing" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "ended", label: "Ended" },
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
    /** Normalized person references (see getMovieDetailApi). */
    directors: PersonRef[];
    actors: PersonRef[];
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
    directorIds: number[];
    actorIds: number[];
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
