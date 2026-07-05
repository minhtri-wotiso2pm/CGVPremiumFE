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

/** Top sellers first (ranked by salesRank), then other NOW_SHOWING movies,
 *  then everything else — so the Hero showcases best-selling movies before
 *  falling back to the old status-based selection. */
export function getFeaturedMovies(movies: Movie[], count = 5): Movie[] {
    const topSellers = getTopSellingMovies(movies);
    const topSellerIds = new Set(topSellers.map(movie => movie.movieId));

    const nowShowing = movies.filter(movie => movie.status === "NOW_SHOWING" && !topSellerIds.has(movie.movieId));
    const rest = movies.filter(movie => movie.status !== "NOW_SHOWING" && !topSellerIds.has(movie.movieId));

    return [...topSellers, ...nowShowing, ...rest].slice(0, count);
}

/** Movies marked as top sellers by the API, ordered by salesRank ascending
 *  (1 = best-selling). Ended movies are excluded even if the backend still
 *  flags them as top-selling — they're not being sold anymore. Used for
 *  both the Hero priority order and the "Top Selling" carousel. */
export function getTopSellingMovies(movies: Movie[]): Movie[] {
    return movies
        .filter(movie => movie.isTopSelling && movie.status !== "ENDED")
        .sort((a, b) => (a.salesRank ?? Infinity) - (b.salesRank ?? Infinity));
}

/** Top sellers first, topped up with other Now Showing movies (most
 *  tickets sold first) until `count` is reached — the home page "Top
 *  Selling" carousel always wants a full row when there's enough data. */
export function getTopSellingCarouselMovies(movies: Movie[], count = 5): Movie[] {
    const topSellers = getTopSellingMovies(movies);
    const topSellerIds = new Set(topSellers.map(movie => movie.movieId));

    const filler = movies
        .filter(movie => movie.status === "NOW_SHOWING" && !topSellerIds.has(movie.movieId))
        .sort((a, b) => b.ticketsSold - a.ticketsSold);

    return [...topSellers, ...filler].slice(0, count);
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