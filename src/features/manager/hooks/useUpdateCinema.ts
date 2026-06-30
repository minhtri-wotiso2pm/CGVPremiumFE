import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCinemaApi } from "@/services/api/manager.service";
import type { UpdateCinemaPayload } from "../types/cinema.types";
import { CINEMA_QUERY_KEY } from "../constants/cinema.constants";
import { notify } from "@/utils/notify";

export function useUpdateCinema() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ cinemaId, payload }: { cinemaId: number; payload: UpdateCinemaPayload }) =>
            updateCinemaApi(cinemaId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CINEMA_QUERY_KEY });
            notify.success("Cinema updated", "Changes have been saved successfully.");
        },
        onError: () => {
            notify.error("Failed to update", "Could not update cinema. Please try again.");
        },
    });
}
