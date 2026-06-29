import { useQuery } from "@tanstack/react-query";
import { getMovieByIdApi } from "@/services/api/movie.service";

export const MOVIE_DETAIL_KEY = (id: number) => ["movie", "detail", id] as const;

export function useMovieDetail(movieId: number) {
    return useQuery({
        queryKey: MOVIE_DETAIL_KEY(movieId),
        queryFn: () => getMovieByIdApi(movieId),
        enabled: !!movieId,
        staleTime: 5 * 60 * 1000,
    });
}
