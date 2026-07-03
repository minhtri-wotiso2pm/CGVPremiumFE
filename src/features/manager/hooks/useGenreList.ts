import { useQuery } from "@tanstack/react-query";
import { getGenresApi } from "@/services/api/movie-mgmt.service";

export const GENRE_QUERY_KEY = ["manager-genres"] as const;

export function useGenreList() {
    return useQuery({
        queryKey: GENRE_QUERY_KEY,
        queryFn: getGenresApi,
        staleTime: 5 * 60_000,
    });
}
