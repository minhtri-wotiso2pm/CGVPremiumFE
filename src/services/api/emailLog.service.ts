import axiosInstance from "@/services/axios/axiosInstance";
import type {
    EmailLogListResponse,
    GetEmailLogsParams,
} from "@/features/admin/types/emailLog.types";

export const getEmailLogsApi = async (
    params: GetEmailLogsParams,
): Promise<EmailLogListResponse> => {
    const { data } = await axiosInstance.get("/admin/email-logs", { params });
    return data;
};
