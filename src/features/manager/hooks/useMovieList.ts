import { useQuery } from "@tanstack/react-query";
import { getMoviesPagedApi } from "@/services/api/movie-mgmt.service";

export const MOVIE_LIST_QUERY_KEY = ["manager-movies"] as const;

export function useMovieList() {
    return useQuery({
        queryKey: MOVIE_LIST_QUERY_KEY,
        queryFn: getMoviesPagedApi,
        staleTime: 2 * 60_000,
    });
}
