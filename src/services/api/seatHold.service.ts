import axiosInstance from "@/services/axios/axiosInstance";
import type { SeatHoldRequest, SeatHoldResponse } from "@/features/booking/types/fnb.types";

export const createSeatHoldApi = async (
    payload: SeatHoldRequest
): Promise<SeatHoldResponse> => {
    const { data } = await axiosInstance.post("/seat-holds", payload);
    return data;
};

export const releaseSeatHoldApi = async (
    payload: SeatHoldRequest
): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete("/seat-holds", { data: payload });
    return data;
};
