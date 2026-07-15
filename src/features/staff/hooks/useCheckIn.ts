import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
    getCheckInHistoryApi,
    lookupCheckInApi,
    performCheckInApi,
} from "@/services/api/checkin.service";
import type { CheckInHistoryQuery } from "@/features/staff/types/checkin.types";

export const CHECKIN_HISTORY_QUERY_KEY = "checkin-history";

export const getCheckInErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
};

export interface CheckInErrorInfo {
    message: string;
    /** "network": request never reached the server (offline/timeout/CORS) —
     *  distinct from "business": the server responded but rejected the
     *  ticket (invalid/expired/already used, etc.). Staff need to react to
     *  these differently, so the UI styles them differently. */
    kind: "network" | "business";
}

export const getCheckInErrorInfo = (error: unknown, fallback: string): CheckInErrorInfo => {
    if (axios.isAxiosError(error)) {
        if (!error.response) {
            return { message: "Could not reach the server. Check your connection and try again.", kind: "network" };
        }
        return { message: error.response.data?.message ?? fallback, kind: "business" };
    }
    return { message: fallback, kind: "business" };
};

export function useCheckInLookup() {
    return useMutation({
        mutationFn: (qrCode: string) => lookupCheckInApi(qrCode),
    });
}

export function usePerformCheckIn() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (qrCode: string) => performCheckInApi(qrCode),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: [CHECKIN_HISTORY_QUERY_KEY] });
            message.success(data.message || "Ticket checked in successfully.");
        },
    });
}

export function useCheckInHistory(query: CheckInHistoryQuery) {
    return useQuery({
        queryKey: [CHECKIN_HISTORY_QUERY_KEY, query],
        queryFn: () => getCheckInHistoryApi(query),
    });
}
