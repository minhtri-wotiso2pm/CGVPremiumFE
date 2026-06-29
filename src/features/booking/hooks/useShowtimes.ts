import { useQuery } from "@tanstack/react-query";
import { getShowtimesApi } from "@/services/api/showtime.service";
import { SHOWTIME_DEFAULT_PARAMS, SHOWTIME_QUERY_KEY } from "../constants/showtime.constants";

export function useShowtimes(movieName: string, date: string) {
    return useQuery({
        queryKey: SHOWTIME_QUERY_KEY(movieName, date),
        queryFn: () =>
            getShowtimesApi({
                movieName,
                date,
                ...SHOWTIME_DEFAULT_PARAMS,
            }),
        enabled: !!movieName && !!date,
        staleTime: 2 * 60 * 1000,
    });
}
