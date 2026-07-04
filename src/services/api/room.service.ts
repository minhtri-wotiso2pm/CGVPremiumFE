import axiosInstance from "@/services/axios/axiosInstance";
import type {
    Room,
    CreateRoomPayload,
    UpdateRoomPayload,
    RoomLayout,
    UpdateRoomLayoutPayload,
} from "@/features/manager/types/room.types";

/** Backend returns status in either case across environments — normalize to uppercase. */
const normalizeRoom = (r: Record<string, unknown>): Room => ({
    roomId: Number(r.roomId),
    cinemaId: Number(r.cinemaId),
    name: String(r.name ?? ""),
    type: String(r.type ?? "Standard"),
    capacity: Number(r.capacity ?? 0),
    status: String(r.status ?? "ACTIVE").toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    description: String(r.description ?? ""),
    createdAt: String(r.createdAt ?? ""),
});

export const getRoomsApi = async (): Promise<Room[]> => {
    const { data } = await axiosInstance.get("/rooms");
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
    return list.map(normalizeRoom);
};

export const createRoomApi = async (payload: CreateRoomPayload): Promise<Room> => {
    const { data } = await axiosInstance.post("/rooms", payload);
    return normalizeRoom(data);
};

export const updateRoomApi = async (roomId: number, payload: UpdateRoomPayload): Promise<Room> => {
    const { data } = await axiosInstance.put(`/rooms/${roomId}`, payload);
    return normalizeRoom(data);
};

export const deleteRoomApi = async (roomId: number): Promise<void> => {
    await axiosInstance.delete(`/rooms/${roomId}`);
};

/* ─── Layout (public GET, manager PUT) ─── */
export const getRoomLayoutApi = async (roomId: number): Promise<RoomLayout> => {
    const { data } = await axiosInstance.get(`/rooms/${roomId}/layout`);
    return {
        roomId: Number(data.roomId ?? roomId),
        totalRows: Number(data.totalRows ?? 0),
        totalCols: Number(data.totalCols ?? 0),
        seats: Array.isArray(data.seats) ? data.seats : [],
    };
};

export const updateRoomLayoutApi = async (
    roomId: number,
    payload: UpdateRoomLayoutPayload,
): Promise<RoomLayout> => {
    const { data } = await axiosInstance.put(`/rooms/${roomId}/layout`, payload);
    return {
        roomId: Number(data.roomId ?? roomId),
        totalRows: Number(data.totalRows ?? payload.totalRows),
        totalCols: Number(data.totalCols ?? payload.totalCols),
        seats: Array.isArray(data.seats) ? data.seats : [],
    };
};
