import axiosInstance from "@/services/axios/axiosInstance";
import type { Cinema, CreateCinemaPayload, UpdateCinemaPayload } from "@/features/manager/types/cinema.types";

/** Read coordinates under any of the common field-name variants — the
 *  backend returns `latitude`/`longitude`, but this stays resilient if
 *  that ever changes to `lat`/`lng` etc. */
const readCoord = (r: Record<string, unknown>, keys: string[]): number | null => {
    for (const key of keys) {
        const v = r[key];
        if (v !== undefined && v !== null && v !== "") return Number(v);
    }
    return null;
};

export const getCinemasApi = async (): Promise<Cinema[]> => {
    const { data } = await axiosInstance.get("/cinemas");
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
    return list.map((r) => ({
        ...(r as unknown as Cinema),
        latitude: readCoord(r, ["latitude", "lat"]),
        longitude: readCoord(r, ["longitude", "lng", "long"]),
    }));
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
