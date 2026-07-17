import { useMutation } from "@tanstack/react-query";
import { lookupBookingApi } from "@/services/api/booking.service";
import { confirmFnbPickupApi } from "@/services/api/checkin.service";

/** POST /bookings/lookup — read-only order + F&B lookup by bookingCode. */
export function useBookingLookup() {
    return useMutation({
        mutationFn: (bookingCode: string) => lookupBookingApi(bookingCode),
    });
}

/** POST /checkins/fnb-pickup — mark all F&B items on the booking picked up. */
export function useConfirmFnbPickup() {
    return useMutation({
        mutationFn: (bookingCode: string) => confirmFnbPickupApi(bookingCode),
    });
}
