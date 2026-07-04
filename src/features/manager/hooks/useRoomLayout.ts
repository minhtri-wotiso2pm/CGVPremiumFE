import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRoomLayoutApi, updateRoomLayoutApi } from "@/services/api/room.service";
import type { UpdateRoomLayoutPayload } from "../types/room.types";
import { ROOM_LAYOUT_QUERY_KEY, ROOM_QUERY_KEY } from "../constants/room.constants";
import { notify } from "@/utils/notify";

export function useRoomLayout(roomId: number) {
    return useQuery({
        queryKey: ROOM_LAYOUT_QUERY_KEY(roomId),
        queryFn: () => getRoomLayoutApi(roomId),
        enabled: !!roomId && !Number.isNaN(roomId),
        staleTime: 0,
    });
}

export function useUpdateRoomLayout(roomId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateRoomLayoutPayload) => updateRoomLayoutApi(roomId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROOM_LAYOUT_QUERY_KEY(roomId) });
            queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEY });
            notify.success("Layout saved", "The seat layout has been updated successfully.");
        },
        onError: () => {
            notify.error("Failed to save", "Could not save the seat layout. Please try again.");
        },
    });
}
