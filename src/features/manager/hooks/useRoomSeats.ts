import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getRoomSeatsApi,
    generateSeatsApi,
    bulkUpdateSeatsApi,
    bulkDeleteSeatsApi,
} from "@/services/api/room.service";
import type {
    GenerateSeatsPayload,
    BulkUpdateSeatsPayload,
    BulkDeleteSeatsPayload,
} from "../types/room.types";
import { ROOM_SEATS_QUERY_KEY } from "../constants/room.constants";
import { notify } from "@/utils/notify";

export function useRoomSeats(roomId: number) {
    return useQuery({
        queryKey: ROOM_SEATS_QUERY_KEY(roomId),
        queryFn: () => getRoomSeatsApi(roomId),
        enabled: !!roomId && !Number.isNaN(roomId),
        staleTime: 0,
    });
}

export function useGenerateSeats(roomId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: GenerateSeatsPayload) => generateSeatsApi(roomId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_SEATS_QUERY_KEY(roomId) });
            notify.success("Seats generated", "The new seat range has been added successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to generate", msg ?? "Could not generate seats. Please check the room status and try again.");
        },
    });
}

export function useBulkUpdateSeats(roomId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkUpdateSeatsPayload) => bulkUpdateSeatsApi(roomId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_SEATS_QUERY_KEY(roomId) });
            notify.success("Seats updated", "The selected seats have been updated successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to update", msg ?? "Could not update the selected seats. Please try again.");
        },
    });
}

export function useBulkDeleteSeats(roomId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkDeleteSeatsPayload) => bulkDeleteSeatsApi(roomId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_SEATS_QUERY_KEY(roomId) });
            notify.success("Seats deleted", "The selected seats have been removed.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to delete", msg ?? "Could not delete the selected seats. Please try again.");
        },
    });
}
