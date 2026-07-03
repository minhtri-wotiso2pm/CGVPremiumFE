import { useQuery } from "@tanstack/react-query";
import { getSeatMapApi } from "@/services/api/seat.service";
import { SEAT_MAP_QUERY_KEY } from "../constants/seat.constants";

/** Polls the seat map every 5s so hold/sold status stays in sync with
 *  other customers booking the same showtime concurrently. Polling
 *  automatically stops once the component unmounts (React Query pauses
 *  refetchInterval for unobserved queries). */
export function useSeatMap(showtimeId: number) {
    return useQuery({
        queryKey: SEAT_MAP_QUERY_KEY(showtimeId),
        queryFn: () => getSeatMapApi(showtimeId),
        enabled: !!showtimeId && !isNaN(showtimeId),
        staleTime: 0,
        refetchInterval: 5_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        retry: 2,
    });
}
