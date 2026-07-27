import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getShowtimeTypesApi,
    getShowtimeTypeDetailApi,
    createShowtimeTypeApi,
    updateShowtimeTypeApi,
    deleteShowtimeTypeApi,
    previewShowtimeTypeApi,
    generateShowtimeTypeApi,
} from "@/services/api/showtimeType.service";
import type {
    CreateShowtimeTypePayload,
    UpdateShowtimeTypePayload,
    ShowtimeTypePreviewRequest,
} from "../types/showtimeType.types";
import {
    SHOWTIME_TYPE_QUERY_KEY,
    SHOWTIME_TYPE_DETAIL_QUERY_KEY,
    SHOWTIME_TYPE_FETCH_ALL_PAGE_SIZE,
} from "../constants/showtimeType.constants";
import { SHOWTIME_MGMT_QUERY_KEY } from "../constants/showtime-mgmt.constants";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

/** Fetches every showtime type for the cinema in one page — see
 *  constants.ts for why (no server search/sort param exists). */
export function useShowtimeTypes(cinemaId: number | null) {
    return useQuery({
        queryKey: [SHOWTIME_TYPE_QUERY_KEY, cinemaId],
        queryFn: () => getShowtimeTypesApi({ cinemaId: cinemaId!, page: 1, pageSize: SHOWTIME_TYPE_FETCH_ALL_PAGE_SIZE }),
        enabled: cinemaId != null,
        staleTime: 60 * 1000,
    });
}

export function useShowtimeTypeDetail(id: number | null) {
    return useQuery({
        queryKey: [SHOWTIME_TYPE_DETAIL_QUERY_KEY, id],
        queryFn: () => getShowtimeTypeDetailApi(id as number),
        enabled: id != null,
        staleTime: 30 * 1000,
    });
}

export function useCreateShowtimeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateShowtimeTypePayload) => createShowtimeTypeApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_TYPE_QUERY_KEY] });
            notify.success("Showtime type created", "The showtime type has been added successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to create", getApiErrorMessage(err, "Could not create showtime type. Please try again."));
        },
    });
}

export function useUpdateShowtimeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateShowtimeTypePayload }) =>
            updateShowtimeTypeApi(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_TYPE_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_TYPE_DETAIL_QUERY_KEY, id] });
            notify.success("Showtime type updated", "Changes have been saved successfully.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to update", getApiErrorMessage(err, "Could not update showtime type. Please try again."));
        },
    });
}

export function useDeleteShowtimeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteShowtimeTypeApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_TYPE_QUERY_KEY] });
            notify.success("Showtime type deleted", "The showtime type has been removed.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to delete", getApiErrorMessage(err, "Could not delete showtime type. It may be in use."));
        },
    });
}

export function usePreviewShowtimeType() {
    return useMutation({
        mutationFn: (payload: ShowtimeTypePreviewRequest) => previewShowtimeTypeApi(payload),
        onError: (err: unknown) => {
            notify.error("Preview failed", getApiErrorMessage(err, "Could not generate a preview. Please try again."));
        },
    });
}

export function useGenerateShowtimeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ShowtimeTypePreviewRequest) => generateShowtimeTypeApi(payload),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_MGMT_QUERY_KEY] });
            notify.success(
                "Generated successfully",
                `${result.generatedCount} showtime${result.generatedCount === 1 ? "" : "s"} created${result.skippedCount > 0 ? `, ${result.skippedCount} skipped due to conflicts` : ""}.`
            );
        },
        onError: (err: unknown) => {
            notify.error("Generate failed", getApiErrorMessage(err, "Could not generate showtimes. Please try again."));
        },
    });
}
