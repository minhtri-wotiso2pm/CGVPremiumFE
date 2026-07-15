import axiosInstance from "@/services/axios/axiosInstance";
import type {
    CheckInActionResponse,
    CheckInHistoryQuery,
    CheckInHistoryResponse,
    CheckInLookupResponse,
} from "@/features/staff/types/checkin.types";

export const lookupCheckInApi = async (qrCode: string): Promise<CheckInLookupResponse> => {
    const { data } = await axiosInstance.post("/checkins/lookup", { qrCode });
    return data;
};

export const performCheckInApi = async (qrCode: string): Promise<CheckInActionResponse> => {
    const { data } = await axiosInstance.post("/checkins", { qrCode });
    return data;
};

export const getCheckInHistoryApi = async (
    query: CheckInHistoryQuery
): Promise<CheckInHistoryResponse> => {
    const { data } = await axiosInstance.get("/checkins/history", { params: query });
    return data;
};
