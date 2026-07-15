import { useQuery } from "@tanstack/react-query";
import { getEmailLogsApi } from "@/services/api/emailLog.service";
import type { GetEmailLogsParams } from "../types/emailLog.types";

export const EMAIL_LOG_QUERY_KEY = "email-logs";

export function useEmailLogs(params: GetEmailLogsParams) {
    return useQuery({
        queryKey: [EMAIL_LOG_QUERY_KEY, params],
        queryFn: () => getEmailLogsApi(params),
        placeholderData: (prev) => prev,
        staleTime: 30 * 1000,
    });
}
