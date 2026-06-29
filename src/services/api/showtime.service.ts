import axiosInstance from "@/services/axios/axiosInstance";
import type { GetShowtimesParams, ShowtimeListResponse } from "@/features/booking/types/showtime.types";

export const getShowtimesApi = async (params: GetShowtimesParams): Promise<ShowtimeListResponse> => {
    const { data } = await axiosInstance.get("/showtimes", { params });
    return data;
};
