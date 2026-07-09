import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createMovieApi,
    updateMovieApi,
    deleteMovieApi,
    uploadMoviePosterApi,
} from "@/services/api/movie-mgmt.service";
import { notify } from "@/utils/notify";
import { MOVIE_LIST_QUERY_KEY } from "./useMovieList";

export function useCreateMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMovieApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            notify.success("Movie Created", "The new movie has been added to the list.");
        },
        onError: () => {
            notify.error("Failed to Create Movie", "Please check the details and try again.");
        },
    });
}

export function useUpdateMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ movieId, payload }: { movieId: number; payload: Parameters<typeof updateMovieApi>[1] }) =>
            updateMovieApi(movieId, payload),
        onSuccess: (_, { movieId }) => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["manager-movie-detail", movieId] });
            notify.success("Updated Successfully", "The movie details have been saved.");
        },
        onError: () => {
            notify.error("Update Failed", "Please check the details and try again.");
        },
    });
}

export function useDeleteMovie() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMovieApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            notify.success("Movie Deleted", "The movie has been removed from the list.");
        },
        onError: () => {
            notify.error("Delete Failed", "Could not delete the movie. Please try again.");
        },
    });
}

export function useUploadMoviePoster() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ movieId, file }: { movieId: number; file: File }) =>
            uploadMoviePosterApi(movieId, file),
        onSuccess: (_, { movieId }) => {
            queryClient.invalidateQueries({ queryKey: MOVIE_LIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["manager-movie-detail", movieId] });
        },
        onError: () => {
            notify.warning("Poster Upload Failed", "The movie was saved but the poster could not be uploaded.");
        },
    });
}
