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
    /** Sales ranking fields from GET /api/movie. salesRank is 1-based
     *  (1 = best-selling); null when the movie isn't a top seller. */
    ticketsSold: number;
    isTopSelling: boolean;
    salesRank: number | null;
}

export interface MovieDetail extends Movie {
    director: string;
    cast: string;
    synopsis: string;
    showingFromDate: string;
    showingToDate: string;
    trailerUrl: string;
}