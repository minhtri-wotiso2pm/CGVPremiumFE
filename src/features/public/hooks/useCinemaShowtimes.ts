import { useQuery } from "@tanstack/react-query";
import { getManagerShowtimesApi } from "@/services/api/showtime-mgmt.service";

/**
 * All scheduled showtimes at a given cinema on a date — powers the public
 * "movies playing at this cinema" page. The movie list is derived from this
 * response (each showtime carries its movie), so there's no separate
 * per-cinema movie endpoint to call.
 */
export function useCinemaShowtimes(cinemaId: number | undefined, date: string) {
    return useQuery({
        queryKey: ["cinema-showtimes", cinemaId, date],
        queryFn: () =>
            getManagerShowtimesApi({
                cinemaId,
                date,
                status: "scheduled",
                page: 1,
                pageSize: 100,
                sortBy: "startTime",
                sortDir: "asc",
            }),
        enabled: !!cinemaId && !!date,
        staleTime: 60_000,
    });
}
