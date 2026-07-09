import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RoomTypeItem,
    CreateRoomTypePayload,
    UpdateRoomTypePayload,
} from "@/features/manager/types/roomType.types";

export const getRoomTypesApi = async (): Promise<RoomTypeItem[]> => {
    const { data } = await axiosInstance.get("/room-types");
    return Array.isArray(data) ? data : (data?.items ?? []);
};

export const getRoomTypeDetailApi = async (id: number): Promise<RoomTypeItem> => {
    const { data } = await axiosInstance.get(`/room-types/${id}`);
    return data;
};

export const createRoomTypeApi = async (payload: CreateRoomTypePayload): Promise<RoomTypeItem> => {
    const { data } = await axiosInstance.post("/room-types", payload);
    return data;
};

export const updateRoomTypeApi = async (id: number, payload: UpdateRoomTypePayload): Promise<RoomTypeItem> => {
    const { data } = await axiosInstance.put(`/room-types/${id}`, payload);
    return data;
};

export const deleteRoomTypeApi = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/room-types/${id}`);
};
