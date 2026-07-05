import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@/features/public/types/movie.type";
import { getMoviesByGenreApi } from "@/services/api/movie.service";

export const RELATED_MOVIES_KEY = (movieId: number, genres: string[]) =>
    ["movies", "related", movieId, ...genres] as const;

const RELATED_COUNT = 5;

/**
 * "You Might Also Like" for a movie detail page: Now Showing movies sharing
 * at least one genre with the current movie. Calls GET /movie?genreName=X
 * once per genre (a movie can have several) and merges the results.
 * Ranked top-selling first (so a hot/trending genre match always leads),
 * then by how many of the current movie's genres each one matches. If
 * fewer than RELATED_COUNT genre matches are found, tops up with other Now
 * Showing movies from `fallbackPool` (the already-loaded catalog).
 */
export function useRelatedMovies(movieId: number, genres: string[], fallbackPool: Movie[]) {
    return useQuery({
        queryKey: RELATED_MOVIES_KEY(movieId, genres),
        queryFn: async () => {
            const perGenre = await Promise.all(
                genres.map((genreName) =>
                    getMoviesByGenreApi({ genreName, status: "NOW_SHOWING", pageSize: 10 }),
                ),
            );

            const matchCounts = new Map<number, number>();
            const byId = new Map<number, Movie>();
            for (const list of perGenre) {
                for (const m of list) {
                    if (m.movieId === movieId) continue;
                    matchCounts.set(m.movieId, (matchCounts.get(m.movieId) ?? 0) + 1);
                    if (!byId.has(m.movieId)) byId.set(m.movieId, m);
                }
            }

            const ranked = Array.from(byId.values()).sort((a, b) => {
                if (a.isTopSelling !== b.isTopSelling) return a.isTopSelling ? -1 : 1;
                return (matchCounts.get(b.movieId) ?? 0) - (matchCounts.get(a.movieId) ?? 0);
            });

            if (ranked.length < RELATED_COUNT) {
                const alreadyIncluded = new Set(ranked.map((m) => m.movieId));
                const filler = fallbackPool.filter(
                    (m) => m.movieId !== movieId && m.status === "NOW_SHOWING" && !alreadyIncluded.has(m.movieId),
                );
                ranked.push(...filler);
            }

            return ranked.slice(0, RELATED_COUNT);
        },
        enabled: genres.length > 0 && !!movieId,
        staleTime: 5 * 60 * 1000,
    });
}
