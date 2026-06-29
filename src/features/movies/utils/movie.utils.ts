import type { Movie } from "../types/movie.types";

export function getMovieGenres(movies: Movie[]): string[] {
    const genres = new Set<string>();

    movies.forEach(movie => {
        movie.genres.forEach(genre => {
            genres.add(genre);
        });
    });

    return Array.from(genres).sort();
}

export function getFeaturedMovie(movies: Movie[]): Movie | null {
    return (
        movies.find(movie => movie.status === "NOW_SHOWING")
        ?? movies[0]
        ?? null
    );
}

import type { StatusFilter } from "../components/MovieFilterBar";

export function getMovieSectionTitle(
    status: StatusFilter,
    search: string,
    genre: string
) {

    if (status === "NOW_SHOWING")
        return "Now Showing";

    if (status === "COMING_SOON")
        return "Coming Soon";

    if (search)
        return `Results for "${search}"`;

    if (genre)
        return `${genre} Movies`;

    return "All Movies";
}