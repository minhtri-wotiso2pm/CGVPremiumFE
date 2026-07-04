import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getRoomsApi,
    createRoomApi,
    updateRoomApi,
    deleteRoomApi,
} from "@/services/api/room.service";
import type { CreateRoomPayload, UpdateRoomPayload } from "../types/room.types";
import { ROOM_QUERY_KEY } from "../constants/room.constants";
import { notify } from "@/utils/notify";

export function useRooms() {
    return useQuery({
        queryKey: ROOM_QUERY_KEY,
        queryFn: getRoomsApi,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoomPayload) => createRoomApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEY });
            notify.success("Room created", "The room has been added successfully.");
        },
        onError: () => {
            notify.error("Failed to create", "Could not create room. Please try again.");
        },
    });
}

export function useUpdateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roomId, payload }: { roomId: number; payload: UpdateRoomPayload }) =>
            updateRoomApi(roomId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEY });
            notify.success("Room updated", "Changes have been saved successfully.");
        },
        onError: () => {
            notify.error("Failed to update", "Could not update room. Please try again.");
        },
    });
}

export function useDeleteRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roomId: number) => deleteRoomApi(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEY });
            notify.success("Room deleted", "The room has been removed.");
        },
        onError: () => {
            notify.error("Failed to delete", "Could not delete room. It may have showtimes or seats.");
        },
    });
}
