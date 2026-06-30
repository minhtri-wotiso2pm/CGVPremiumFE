import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCinemaApi } from "@/services/api/manager.service";
import { CINEMA_QUERY_KEY } from "../constants/cinema.constants";
import { notify } from "@/utils/notify";

export function useCreateCinema() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCinemaApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CINEMA_QUERY_KEY });
            notify.success("Cinema created", "The cinema has been added successfully.");
        },
        onError: () => {
            notify.error("Failed to create", "Could not create cinema. Please try again.");
        },
    });
}
