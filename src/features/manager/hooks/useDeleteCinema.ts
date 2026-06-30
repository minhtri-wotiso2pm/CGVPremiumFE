import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCinemaApi } from "@/services/api/manager.service";
import { CINEMA_QUERY_KEY } from "../constants/cinema.constants";
import { notify } from "@/utils/notify";

export function useDeleteCinema() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCinemaApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CINEMA_QUERY_KEY });
            notify.success("Cinema deleted", "The cinema has been removed successfully.");
        },
        onError: () => {
            notify.error("Failed to delete", "Could not delete cinema. Please try again.");
        },
    });
}
