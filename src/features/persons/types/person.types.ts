/* ══════════════════════════════════════════
   Person (Cast & Crew) — types
   API: GET/POST/PUT/DELETE /api/persons
══════════════════════════════════════════ */

/** Lightweight item returned by GET /api/persons (autocomplete/list). */
export interface PersonListItem {
    id: number;
    name: string;
    photoUrl?: string | null;
    nationality?: string | null;
}

/** Full record returned by GET /api/persons/{id}. */
export interface PersonDetail {
    id: number;
    name: string;
    biography?: string | null;
    dateOfBirth?: string | null;
    nationality?: string | null;
    gender?: string | null;
    photoUrl?: string | null;
    photoPublicId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PersonListResponse {
    items: PersonListItem[];
    page: number;
    pageSize: number;
    total: number;
}

export interface GetPersonsParams {
    search?: string;
    page?: number;
    pageSize?: number;
}

/** Body for POST/PUT /api/persons. */
export interface CreatePersonPayload {
    name: string;
    biography?: string | null;
    dateOfBirth?: string | null;
    nationality?: string | null;
    gender?: string | null;
    photoUrl?: string | null;
    photoPublicId?: string | null;
}

export type UpdatePersonPayload = CreatePersonPayload;

/** Result of POST /api/uploads/person-photo. */
export interface PersonPhotoUploadResult {
    url: string;
    publicId: string;
}

/** Minimal person reference used inside the Movie form selects. */
export interface PersonRef {
    id: number;
    name: string;
    photoUrl?: string | null;
    nationality?: string | null;
}

/** DELETE conflict body when a person is still assigned to movies. */
export interface PersonDeleteConflict {
    message: string;
    movies: string[];
}

/** One movie in a person's filmography (GET /api/persons/{id}/movies). */
export interface PersonFilmographyItem {
    movieId: number;
    title: string;
    posterUrl?: string | null;
    releaseDate?: string | null;
    duration?: number; // minutes
    ageRating?: string;
    roles: string[]; // e.g. ["Director"], ["Actor"], ["Director", "Actor"]
}

/** Paginated filmography response. */
export interface PersonMoviesResponse {
    personId: number;
    personName: string;
    totalMovies: number;
    page: number;
    pageSize: number;
    items: PersonFilmographyItem[];
}

export type PersonModalType = "create" | "edit" | "delete";
