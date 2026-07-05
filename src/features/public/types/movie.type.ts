export type MovieStatus =
    | "COMING_SOON"
    | "NOW_SHOWING"
    | "ENDED";

export type AgeRating =
    | "P"
    | "K"
    | "T13"
    | "T16"
    | "T18"
    | "C18";

export interface Movie {
    movieId: number;
    title: string;
    genres: string[];
    ageRating: AgeRating;
    posterUrl: string;
    durationMinutes: number;
    status: MovieStatus;
    /** Sales ranking fields from GET /api/movie. salesRank is 1-based
     *  (1 = best-selling); null when the movie isn't a top seller. */
    ticketsSold: number;
    isTopSelling: boolean;
    salesRank: number | null;
}

export type GetMoviesResponse = Movie[];