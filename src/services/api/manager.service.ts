import axiosInstance from "@/services/axios/axiosInstance";
import type { Cinema, CreateCinemaPayload, UpdateCinemaPayload } from "@/features/manager/types/cinema.types";

export const getCinemasApi = async (): Promise<Cinema[]> => {
    const { data } = await axiosInstance.get("/cinemas");
    return Array.isArray(data) ? data : (data.items ?? data.data ?? []);
};

export const createCinemaApi = async (
    payload: CreateCinemaPayload
): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post("/cinemas", payload);
    return data;
};

export const updateCinemaApi = async (
    cinemaId: number,
    payload: UpdateCinemaPayload
): Promise<{ message: string }> => {
    const { data } = await axiosInstance.put(`/cinemas/${cinemaId}`, payload);
    return data;
};

export const deleteCinemaApi = async (
    cinemaId: number
): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/cinemas/${cinemaId}`);
    return data;
};
