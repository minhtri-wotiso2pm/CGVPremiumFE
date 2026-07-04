export type RoomStatus = "ACTIVE" | "INACTIVE";

/** Valid room types per API_REPORT (§1). */
export const ROOM_TYPES = ["Standard", "VIP", "IMAX", "3D"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export interface Room {
    roomId: number;
    cinemaId: number;
    name: string;
    type: RoomType | string;
    capacity: number;
    status: RoomStatus;
    description: string;
    createdAt: string;
}

export interface CreateRoomPayload {
    cinemaId: number;
    name: string;
    type: string;
    status: RoomStatus;
    description: string;
}

/** PUT /api/rooms/{id} — same shape as create (cinemaId included). */
export type UpdateRoomPayload = CreateRoomPayload;

export type RoomModalType = "create" | "edit" | "delete";

/* ─── Seat types (§8) ─── */
export interface SeatType {
    seatTypeId: number;
    typeName: string;
    capacity: number;
    extraPrice: number;
}

export interface SeatTypePayload {
    typeName: string;
    capacity: number;
    extraPrice: number;
}

export type SeatTypeModalType = "create" | "edit" | "delete";

/* ─── Room seat layout (§7) ─── */

/** A materialized seat returned by GET /api/rooms/{id}/layout. */
export interface LayoutSeat {
    seatId: number;
    roomId: number;
    rowLabel: string;
    seatNumber: number;
    seatCode: string;
    seatTypeId: number;
    type: string;
    status: string;
}

export interface RoomLayout {
    roomId: number;
    totalRows: number;
    totalCols: number;
    seats: LayoutSeat[];
}

/** One cell in the PUT /api/rooms/{id}/layout payload (seat OR walkway). */
export interface LayoutCellPayload {
    rowLabel: string;
    colIndex: number;
    seatName: string | null;
    seatTypeId: number | null;
    status: string | null;
    isWalkway: boolean;
}

export interface UpdateRoomLayoutPayload {
    totalRows: number;
    totalCols: number;
    seats: LayoutCellPayload[];
}
