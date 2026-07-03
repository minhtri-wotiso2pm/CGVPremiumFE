import { useMutation } from "@tanstack/react-query";
import { createSeatHoldApi, releaseSeatHoldApi } from "@/services/api/seatHold.service";

export function useSeatHold() {
    return useMutation({
        mutationFn: createSeatHoldApi,
    });
}

/** Best-effort cleanup mutation — releases a seat hold when the user
 *  abandons the booking flow (e.g. navigates back to Seat Selection). */
export function useReleaseSeatHold() {
    return useMutation({
        mutationFn: releaseSeatHoldApi,
    });
}
