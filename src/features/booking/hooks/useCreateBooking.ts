import { useMutation } from "@tanstack/react-query";
import { createBookingApi } from "@/services/api/booking.service";

export function useCreateBooking() {
    return useMutation({ mutationFn: createBookingApi });
}
