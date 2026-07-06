import { useQuery } from "@tanstack/react-query";
import {
    getActivityLogsApi,
    getActivityLogDetailApi,
    getActionTypesApi,
} from "@/services/api/activityLog.service";
import type { GetActivityLogsParams } from "../types/activityLog.types";
import {
    ACTIVITY_LOG_QUERY_KEY,
    ACTIVITY_LOG_DETAIL_QUERY_KEY,
    ACTION_TYPES_QUERY_KEY,
} from "../constants/activityLog.constants";

export function useActivityLogs(params: GetActivityLogsParams) {
    return useQuery({
        queryKey: [ACTIVITY_LOG_QUERY_KEY, params],
        queryFn: () => getActivityLogsApi(params),
        placeholderData: (prev) => prev,
        staleTime: 30 * 1000,
    });
}

export function useActivityLogDetail(logId: number | null) {
    return useQuery({
        queryKey: [ACTIVITY_LOG_DETAIL_QUERY_KEY, logId],
        queryFn: () => getActivityLogDetailApi(logId as number),
        enabled: logId != null,
        staleTime: 60 * 1000,
    });
}

export function useActionTypes() {
    return useQuery({
        queryKey: [ACTION_TYPES_QUERY_KEY],
        queryFn: getActionTypesApi,
        staleTime: 10 * 60 * 1000,
    });
}
