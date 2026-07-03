import { useMutation } from "@tanstack/react-query";
import { createSeatHoldApi } from "@/services/api/seatHold.service";

export function useSeatHold() {
    return useMutation({
        mutationFn: createSeatHoldApi,
    });
}
