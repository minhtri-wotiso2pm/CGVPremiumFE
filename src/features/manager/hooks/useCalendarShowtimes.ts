import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";
import { getManagerShowtimesApi } from "@/services/api/showtime-mgmt.service";
import type { ManagerShowtime } from "../types/showtime-mgmt.types";
import { SHOWTIME_MGMT_QUERY_KEY } from "../constants/showtime-mgmt.constants";

function enumerateDates(start: Dayjs, end: Dayjs): string[] {
    const dates: string[] = [];
    let cursor = start.startOf("day");
    const last = end.startOf("day");
    while (cursor.isBefore(last) || cursor.isSame(last, "day")) {
        dates.push(cursor.format("YYYY-MM-DD"));
        cursor = cursor.add(1, "day");
    }
    return dates;
}

/** GET /showtimes only accepts a single `date`, not a range — so a
 *  Week/Month calendar view fires one request per visible day (in
 *  parallel via useQueries) and merges the results client-side. Accepted
 *  trade-off until the backend exposes a date-range param (see the
 *  Showtime Type Management gap analysis). */
export function useCalendarShowtimes(range: [Dayjs, Dayjs], cinemaId: number | null) {
    const dates = useMemo(() => enumerateDates(range[0], range[1]), [range]);

    const results = useQueries({
        queries: dates.map((date) => ({
            queryKey: [SHOWTIME_MGMT_QUERY_KEY, "calendar", cinemaId, date],
            queryFn: () => getManagerShowtimesApi({ cinemaId: cinemaId ?? undefined, date, page: 1, pageSize: 100 }),
            enabled: cinemaId != null,
            staleTime: 30 * 1000,
        })),
    });

    const items = useMemo<ManagerShowtime[]>(
        () => results.flatMap((r) => r.data?.items ?? []),
        [results],
    );

    return {
        items,
        isLoading: results.some((r) => r.isLoading),
        isFetching: results.some((r) => r.isFetching),
        isError: results.some((r) => r.isError),
        refetchAll: () => results.forEach((r) => r.refetch()),
    };
}
