import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getSeatTypesApi,
    createSeatTypeApi,
    updateSeatTypeApi,
    deleteSeatTypeApi,
} from "@/services/api/seatType.service";
import type { SeatTypePayload } from "../types/room.types";
import { SEAT_TYPE_QUERY_KEY } from "../constants/room.constants";
import { notify } from "@/utils/notify";

export function useSeatTypes() {
    return useQuery({
        queryKey: SEAT_TYPE_QUERY_KEY,
        queryFn: getSeatTypesApi,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateSeatType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SeatTypePayload) => createSeatTypeApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEAT_TYPE_QUERY_KEY });
            notify.success("Seat type created", "The seat type has been added successfully.");
        },
        onError: () => {
            notify.error("Failed to create", "Could not create seat type. Please try again.");
        },
    });
}

export function useUpdateSeatType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ seatTypeId, payload }: { seatTypeId: number; payload: SeatTypePayload }) =>
            updateSeatTypeApi(seatTypeId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEAT_TYPE_QUERY_KEY });
            notify.success("Seat type updated", "Changes have been saved successfully.");
        },
        onError: () => {
            notify.error("Failed to update", "Could not update seat type. Please try again.");
        },
    });
}

export function useDeleteSeatType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (seatTypeId: number) => deleteSeatTypeApi(seatTypeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SEAT_TYPE_QUERY_KEY });
            notify.success("Seat type deleted", "The seat type has been removed.");
        },
        onError: () => {
            notify.error("Failed to delete", "Could not delete seat type. It may be in use by seats.");
        },
    });
}
