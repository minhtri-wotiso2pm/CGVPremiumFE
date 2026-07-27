import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getManagerShowtimesApi,
    createShowtimeApi,
    updateShowtimeApi,
    deleteShowtimeApi,
} from "@/services/api/showtime-mgmt.service";
import type {
    GetManagerShowtimesParams,
    CreateShowtimePayload,
    UpdateShowtimePayload,
} from "../types/showtime-mgmt.types";
import { SHOWTIME_MGMT_QUERY_KEY } from "../constants/showtime-mgmt.constants";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

export function useManagerShowtimes(params: GetManagerShowtimesParams, enabled: boolean) {
    return useQuery({
        // Every param that changes the response must be in the key — the page
        // runs two of these side by side (the paged table and the unfiltered
        // stats fetch) and they collided on an identical key, so the table
        // rendered whatever the other query had cached.
        queryKey: [
            SHOWTIME_MGMT_QUERY_KEY,
            "list",
            params.cinemaId ?? "none",
            params.date ?? "all",
            params.status ?? "all",
            params.page ?? 1,
            params.pageSize ?? "default",
            params.sortBy ?? "none",
            params.sortDir ?? "none",
        ],
        queryFn: () => getManagerShowtimesApi(params),
        enabled,
        staleTime: 30 * 1000,
    });
}

export function useCreateShowtime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateShowtimePayload) => createShowtimeApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_MGMT_QUERY_KEY] });
            notify.success("Showtime created", "The showtime has been scheduled successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to create", msg ?? "Could not create showtime. Check for time/room conflicts.");
        },
    });
}

export function useUpdateShowtime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ showtimeId, payload }: { showtimeId: number; payload: UpdateShowtimePayload }) =>
            updateShowtimeApi(showtimeId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_MGMT_QUERY_KEY] });
            notify.success("Showtime updated", "Changes have been saved successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to update", msg ?? "Could not update showtime. Check for time/room conflicts.");
        },
    });
}

export function useDeleteShowtime() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (showtimeId: number) => deleteShowtimeApi(showtimeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SHOWTIME_MGMT_QUERY_KEY] });
            notify.success("Showtime deleted", "The showtime has been removed.");
        },
        onError: (err: unknown) => {
            notify.error("Failed to delete", getApiErrorMessage(err, "Could not delete showtime. It may already have bookings."));
        },
    });
}
