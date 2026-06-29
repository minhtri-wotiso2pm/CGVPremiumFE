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
}

export type GetMoviesResponse = Movie[];