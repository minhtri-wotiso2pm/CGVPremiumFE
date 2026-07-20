import axiosInstance from "@/services/axios/axiosInstance";
import type {
    Room,
    CreateRoomPayload,
    UpdateRoomPayload,
    ConfigSeat,
    GetRoomSeatsParams,
    GenerateSeatsPayload,
    BulkUpdateSeatsPayload,
    BulkDeleteSeatsPayload,
} from "@/features/manager/types/room.types";

/** Backend returns status in either case across environments — normalize to uppercase. */
const normalizeRoom = (r: Record<string, unknown>): Room => {
    // Room type comes back as a nested `room_type` object (roomTypeId,
    // typeName, extraPrice, description) rather than a flat roomTypeId —
    // fall back to a flat field in case some responses ever shift shape.
    const roomType = r.room_type as Record<string, unknown> | undefined;
    return {
        roomId: Number(r.roomId),
        cinemaId: Number(r.cinemaId),
        name: String(r.name ?? ""),
        capacity: Number(r.capacity ?? 0),
        status: String(r.status ?? "ACTIVE").toUpperCase() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        description: String(r.description ?? ""),
        createdAt: String(r.createdAt ?? ""),
        roomTypeId: Number(roomType?.roomTypeId ?? r.roomTypeId ?? 0),
    };
};

export const getRoomsApi = async (): Promise<Room[]> => {
    const { data } = await axiosInstance.get("/rooms");
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
    return list.map(normalizeRoom);
};

export const createRoomApi = async (payload: CreateRoomPayload): Promise<Room> => {
    const { data } = await axiosInstance.post("/rooms", payload);
    return normalizeRoom(data);
};

export interface UpdateRoomResult {
    room: Room;
    /** Message from the backend response, surfaced to the user as-is (e.g. the
     *  reason a room could/couldn't be set inactive). Null when absent. */
    message: string | null;
}

export const updateRoomApi = async (roomId: number, payload: UpdateRoomPayload): Promise<UpdateRoomResult> => {
    const { data } = await axiosInstance.put(`/rooms/${roomId}`, payload);
    const message = typeof data?.message === "string" ? data.message : null;
    return { room: normalizeRoom(data?.room ?? data), message };
};

export const deleteRoomApi = async (roomId: number): Promise<void> => {
    await axiosInstance.delete(`/rooms/${roomId}`);
};

/* ─── Seats (API_REPORT §4.6 — public GET with filters, Manager generate
   + bulk PATCH/DELETE; mutations only allowed while the room is inactive) ─── */
const normalizeConfigSeat = (s: Record<string, unknown>): ConfigSeat => ({
    seatId: Number(s.seatId ?? s.seatID ?? 0),
    roomId: Number(s.roomId ?? s.roomID ?? 0),
    rowLabel: String(s.rowLabel ?? ""),
    seatNumber: Number(s.seatNumber ?? 0),
    seatCode: String(s.seatCode ?? ""),
    seatTypeId: Number(s.seatTypeId ?? 0),
    type: String(s.type ?? ""),
    status: String(s.status ?? "active").toLowerCase() === "inactive" ? "inactive" : "active",
    isGap: Boolean(s.isGap),
});

export const getRoomSeatsApi = async (
    roomId: number,
    params?: GetRoomSeatsParams,
): Promise<ConfigSeat[]> => {
    const { data } = await axiosInstance.get(`/rooms/${roomId}/seats`, {
        params: {
            seatId: params?.seatId,
            rows: params?.rows?.join(","),
            columns: params?.columns?.join(","),
        },
    });
    // Real response is grouped by row: { roomId, rows: [{ rowLabel, seats: [...] }] }
    // — flatten it back into a single seat list. Fall back to a bare array or
    // an {items}/{data} envelope in case the shape ever changes.
    let list: Record<string, unknown>[];
    if (Array.isArray(data)) {
        list = data;
    } else if (Array.isArray(data?.rows)) {
        list = (data.rows as Record<string, unknown>[]).flatMap(
            (r) => (Array.isArray(r.seats) ? (r.seats as Record<string, unknown>[]) : []),
        );
    } else {
        list = data?.items ?? data?.data ?? [];
    }
    return list.map(normalizeConfigSeat);
};

// Response shape isn't documented — the caller invalidates and refetches
// getRoomSeatsApi afterward, so we don't need to parse the body here.
export const generateSeatsApi = async (roomId: number, payload: GenerateSeatsPayload): Promise<void> => {
    await axiosInstance.post(`/rooms/${roomId}/seats/generate`, payload);
};

export const bulkUpdateSeatsApi = async (
    roomId: number,
    payload: BulkUpdateSeatsPayload,
): Promise<void> => {
    await axiosInstance.patch(`/rooms/${roomId}/seats/bulk`, payload);
};

export const bulkDeleteSeatsApi = async (
    roomId: number,
    payload: BulkDeleteSeatsPayload,
): Promise<void> => {
    await axiosInstance.delete(`/rooms/${roomId}/seats/bulk`, { data: payload });
};
