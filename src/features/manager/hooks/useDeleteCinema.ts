import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCinemaApi } from "@/services/api/manager.service";
import { CINEMA_QUERY_KEY } from "../constants/cinema.constants";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

export function useDeleteCinema() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCinemaApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CINEMA_QUERY_KEY });
            notify.success("Cinema deleted", "The cinema has been removed successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to delete", getApiErrorMessage(err, "Could not delete cinema. Please try again."));
        },
    });
}
