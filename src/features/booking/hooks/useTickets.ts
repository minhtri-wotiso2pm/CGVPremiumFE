import { useQuery } from "@tanstack/react-query";
import { getTicketsByBookingApi } from "@/services/api/ticket.service";

export function useTickets(bookingId: number | null, enabled = true) {
    return useQuery({
        queryKey: ["tickets", bookingId],
        queryFn: () => getTicketsByBookingApi(bookingId as number),
        enabled: enabled && !!bookingId && !Number.isNaN(bookingId),
        staleTime: 60 * 1000,
    });
}
