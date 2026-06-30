import { useQuery } from "@tanstack/react-query";
import { getSeatMapApi } from "@/services/api/seat.service";
import { SEAT_MAP_QUERY_KEY } from "../constants/seat.constants";

export function useSeatMap(showtimeId: number) {
    return useQuery({
        queryKey: SEAT_MAP_QUERY_KEY(showtimeId),
        queryFn: () => getSeatMapApi(showtimeId),
        enabled: !!showtimeId && !isNaN(showtimeId),
        staleTime: 60_000,
        retry: 2,
    });
}
