import { useQuery } from "@tanstack/react-query";
import { getMyBookingsApi } from "@/services/api/booking.service";

export function useMyBookings(enabled = true) {
    return useQuery({
        queryKey: ["my-bookings"],
        queryFn: getMyBookingsApi,
        staleTime: 60 * 1000,
        enabled,
    });
}
