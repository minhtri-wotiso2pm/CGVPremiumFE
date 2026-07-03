import { useQuery } from "@tanstack/react-query";
import { getMovieDetailApi } from "@/services/api/movie-mgmt.service";

export function useManagerMovieDetail(movieId: number | null) {
    return useQuery({
        queryKey: ["manager-movie-detail", movieId],
        queryFn: () => getMovieDetailApi(movieId!),
        enabled: !!movieId,
        staleTime: 0,
    });
}
