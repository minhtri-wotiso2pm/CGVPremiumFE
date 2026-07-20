import { useQuery } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";
import { getShowtimesRangeApi } from "@/services/api/showtime-mgmt.service";
import type { ManagerShowtime } from "../types/showtime-mgmt.types";
import { SHOWTIME_MGMT_QUERY_KEY } from "../constants/showtime-mgmt.constants";

/** GET /showtimes/range returns the whole calendar window in a single
 *  request — replacing the previous one-request-per-day fan-out. */
export function useCalendarShowtimes(range: [Dayjs, Dayjs], cinemaId: number | null) {
    const startDate = range[0].format("YYYY-MM-DD");
    const endDate = range[1].format("YYYY-MM-DD");

    const query = useQuery({
        queryKey: [SHOWTIME_MGMT_QUERY_KEY, "calendar-range", cinemaId, startDate, endDate],
        queryFn: () => getShowtimesRangeApi({ cinemaId: cinemaId as number, startDate, endDate }),
        enabled: cinemaId != null,
        staleTime: 30 * 1000,
    });

    return {
        items: (query.data ?? []) as ManagerShowtime[],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetchAll: () => query.refetch(),
    };
}
