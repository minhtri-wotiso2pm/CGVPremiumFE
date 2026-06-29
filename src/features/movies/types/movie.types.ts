/**
 * movie.types.ts
 * Shared Movie entity type — matches API response.
 * Place at: src/types/movie.types.ts
 */
export interface Movie {
    movieId: number;
    title: string;
    genres: string[];
    ageRating: string;
    posterUrl: string;
    durationMinutes: number;
    status: string;
}