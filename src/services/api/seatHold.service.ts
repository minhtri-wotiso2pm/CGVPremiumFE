import axiosInstance from "@/services/axios/axiosInstance";
import type { SeatHoldRequest, SeatHoldResponse } from "@/features/booking/types/fnb.types";

export const createSeatHoldApi = async (
    payload: SeatHoldRequest
): Promise<SeatHoldResponse> => {
    const { data } = await axiosInstance.post("/seat-holds", payload);
    return data;
};
