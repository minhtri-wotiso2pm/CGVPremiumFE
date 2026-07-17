import { useQuery } from "@tanstack/react-query";
import { getManagerShowtimesApi } from "@/services/api/showtime-mgmt.service";

/**
 * All scheduled showtimes at the staff's cinema on a given date, so the
 * counter can list every movie playing that day (movies are derived from
 * this response — no separate /movie call needed).
 */
export function useCounterShowtimes(cinemaId: number | undefined, date: string) {
    return useQuery({
        queryKey: ["counter-showtimes", cinemaId, date],
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
