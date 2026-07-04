import axiosInstance from "@/services/axios/axiosInstance";
import type { SeatType, SeatTypePayload } from "@/features/manager/types/room.types";

export const getSeatTypesApi = async (): Promise<SeatType[]> => {
    const { data } = await axiosInstance.get("/seat-types");
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
};

export const createSeatTypeApi = async (payload: SeatTypePayload): Promise<SeatType> => {
    const { data } = await axiosInstance.post("/seat-types", payload);
    return data;
};

export const updateSeatTypeApi = async (
    seatTypeId: number,
    payload: SeatTypePayload,
): Promise<SeatType> => {
    const { data } = await axiosInstance.put(`/seat-types/${seatTypeId}`, payload);
    return data;
};

export const deleteSeatTypeApi = async (seatTypeId: number): Promise<void> => {
    await axiosInstance.delete(`/seat-types/${seatTypeId}`);
};
