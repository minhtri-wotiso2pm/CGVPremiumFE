import axiosInstance from "@/services/axios/axiosInstance";
import type {
    ShowtimeTypeListResponse,
    ShowtimeTypeDetail,
    GetShowtimeTypesParams,
    CreateShowtimeTypePayload,
    UpdateShowtimeTypePayload,
    MutateShowtimeTypeResponse,
    ShowtimeTypePreviewRequest,
    ShowtimeTypePreviewResponse,
    ShowtimeTypeGenerateResponse,
} from "@/features/manager/types/showtimeType.types";

export const getShowtimeTypesApi = async (
    params: GetShowtimeTypesParams
): Promise<ShowtimeTypeListResponse> => {
    const { data } = await axiosInstance.get("/showtime-types", { params });
    return data;
};

export const getShowtimeTypeDetailApi = async (id: number): Promise<ShowtimeTypeDetail> => {
    const { data } = await axiosInstance.get(`/showtime-types/${id}`);
    return data;
};

export const createShowtimeTypeApi = async (
    payload: CreateShowtimeTypePayload
): Promise<MutateShowtimeTypeResponse> => {
    const { data } = await axiosInstance.post("/showtime-types", payload);
    return data;
};

export const updateShowtimeTypeApi = async (
    id: number,
    payload: UpdateShowtimeTypePayload
): Promise<MutateShowtimeTypeResponse> => {
    const { data } = await axiosInstance.put(`/showtime-types/${id}`, payload);
    return data;
};

export const deleteShowtimeTypeApi = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/showtime-types/${id}`);
};

export const previewShowtimeTypeApi = async (
    payload: ShowtimeTypePreviewRequest
): Promise<ShowtimeTypePreviewResponse> => {
    const { data } = await axiosInstance.post("/showtime-types/preview", payload);
    return data;
};

export const generateShowtimeTypeApi = async (
    payload: ShowtimeTypePreviewRequest
): Promise<ShowtimeTypeGenerateResponse> => {
    const { data } = await axiosInstance.post("/showtime-types/generate", payload);
    return data;
};
