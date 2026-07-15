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
