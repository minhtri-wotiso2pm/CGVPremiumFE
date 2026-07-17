import axiosInstance from "@/services/axios/axiosInstance";
import type {
    CheckInActionResponse,
    CheckInHistoryQuery,
    CheckInHistoryResponse,
    CheckInLookupResponse,
} from "@/features/staff/types/checkin.types";
import type { FnbPickupResponse } from "@/features/staff/types/fnbPickup.types";

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

/**
 * POST /api/checkins/fnb-pickup — marks every F&B item on the booking as picked up.
 * Server rejects if already picked up, unpaid, cancelled, or has no F&B.
 */
export const confirmFnbPickupApi = async (bookingCode: string): Promise<FnbPickupResponse> => {
    const { data } = await axiosInstance.post<FnbPickupResponse>("/checkins/fnb-pickup", { bookingCode });
    return data;
};
