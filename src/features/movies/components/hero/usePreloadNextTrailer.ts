import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { MOVIE_DETAIL_KEY } from "@/features/movies/hooks/useMovieDetail";
import { getMovieByIdApi } from "@/services/api/movie.service";

/**
 * PreloadManager — warms the react-query cache with the *next* slide's
 * detail (trailerUrl/synopsis) so it's ready the instant the carousel
 * advances. Data-only: it never mounts a video player for the next slide,
 * keeping "only one video renders at a time" intact.
 */
export function usePreloadNextTrailer(nextMovieId: number | undefined): void {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!nextMovieId) return;
        queryClient.prefetchQuery({
            queryKey: MOVIE_DETAIL_KEY(nextMovieId),
            queryFn: () => getMovieByIdApi(nextMovieId),
            staleTime: 5 * 60 * 1000,
        });
    }, [nextMovieId, queryClient]);
}
