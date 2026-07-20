import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lookupBookingApi } from "@/services/api/booking.service";
import { confirmFnbPickupApi, getFnbPickupHistoryApi } from "@/services/api/checkin.service";
import type { FnbPickupHistoryQuery } from "@/features/staff/types/fnbPickup.types";

export const FNB_PICKUP_HISTORY_QUERY_KEY = "fnb-pickup-history";

/** POST /bookings/lookup — read-only order + F&B lookup by bookingCode. */
export function useBookingLookup() {
    return useMutation({
        mutationFn: (bookingCode: string) => lookupBookingApi(bookingCode),
    });
}

/** POST /checkins/fnb-pickup — mark all F&B items on the booking picked up. */
export function useConfirmFnbPickup() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (bookingCode: string) => confirmFnbPickupApi(bookingCode),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [FNB_PICKUP_HISTORY_QUERY_KEY] });
        },
    });
}

/** GET /checkins/fnb-pickup-history — past pickups for this staff + cinema. */
export function useFnbPickupHistory(query: FnbPickupHistoryQuery, enabled = true) {
    return useQuery({
        queryKey: [FNB_PICKUP_HISTORY_QUERY_KEY, query],
        queryFn: () => getFnbPickupHistoryApi(query),
        enabled: enabled && query.staffId > 0 && query.cinemaId > 0,
    });
}
