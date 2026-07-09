import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getRoomTypesApi,
    createRoomTypeApi,
    updateRoomTypeApi,
    deleteRoomTypeApi,
} from "@/services/api/roomType.service";
import type { CreateRoomTypePayload, UpdateRoomTypePayload } from "../types/roomType.types";
import { ROOM_TYPE_QUERY_KEY } from "../constants/roomType.constants";
import { notify } from "@/utils/notify";

/** Shared by Admin's Room Type Management page and Manager's Room
 *  create/edit form (real type options + extra price), so both stay in
 *  sync via the same React Query cache. */
export function useRoomTypes() {
    return useQuery({
        queryKey: ROOM_TYPE_QUERY_KEY,
        queryFn: getRoomTypesApi,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateRoomType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoomTypePayload) => createRoomTypeApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_TYPE_QUERY_KEY });
            notify.success("Room type created", "The room type has been added successfully.");
        },
        onError: () => {
            notify.error("Failed to create", "Could not create room type. The name may already be in use.");
        },
    });
}

export function useUpdateRoomType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateRoomTypePayload }) =>
            updateRoomTypeApi(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_TYPE_QUERY_KEY });
            notify.success("Room type updated", "Changes have been saved successfully.");
        },
        onError: () => {
            notify.error("Failed to update", "Could not update room type. Please try again.");
        },
    });
}

export function useDeleteRoomType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteRoomTypeApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_TYPE_QUERY_KEY });
            notify.success("Room type deleted", "The room type has been removed.");
        },
        onError: () => {
            notify.error("Cannot delete", "This room type is still in use by one or more rooms.");
        },
    });
}
