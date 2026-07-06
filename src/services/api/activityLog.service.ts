import axiosInstance from "@/services/axios/axiosInstance";
import type {
    ActivityLogListResponse,
    ActivityLogDetail,
    ActionTypeOption,
    GetActivityLogsParams,
} from "@/features/admin/types/activityLog.types";

export const getActivityLogsApi = async (
    params: GetActivityLogsParams
): Promise<ActivityLogListResponse> => {
    const { data } = await axiosInstance.get("/admin/activity-logs", { params });
    return data;
};

export const getActivityLogDetailApi = async (logId: number): Promise<ActivityLogDetail> => {
    const { data } = await axiosInstance.get(`/admin/activity-logs/${logId}`);
    return data;
};

export const getActionTypesApi = async (): Promise<ActionTypeOption[]> => {
    const { data } = await axiosInstance.get("/admin/activity-logs/action-types");
    const list: unknown[] = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map((raw) => {
        if (typeof raw === "string") return { value: raw, label: raw };
        const r = raw as Record<string, unknown>;
        const value = String(r.value ?? r.actionType ?? r.name ?? "");
        return { value, label: String(r.label ?? value) };
    });
};
