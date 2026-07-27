import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGenreApi, updateGenreApi, deleteGenreApi } from "@/services/api/movie-mgmt.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { GENRE_QUERY_KEY } from "./useGenreList";

export function useCreateGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createGenreApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Genre Added", "The new genre has been added successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to Add Genre", getApiErrorMessage(err, "Could not add the genre. Please try again."));
        },
    });
}

export function useUpdateGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ genreId, genreName }: { genreId: number; genreName: string }) =>
            updateGenreApi(genreId, genreName),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Genre Updated", "The genre name has been updated.");
        },
        onError: (err: unknown) => {
            notify.error("Update Failed", getApiErrorMessage(err, "Could not update the genre. Please try again."));
        },
    });
}

export function useDeleteGenre() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteGenreApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GENRE_QUERY_KEY });
            notify.success("Genre Deleted", "The genre has been removed.");
        },
        onError: (err: unknown) => {
            notify.error("Delete Failed", getApiErrorMessage(err, "Could not delete the genre. Please try again."));
        },
    });
}
