import type { Movie } from "../types/movie.types";

export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

export function formatShowingDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

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