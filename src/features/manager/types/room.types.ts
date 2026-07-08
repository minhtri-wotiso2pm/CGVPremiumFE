export type RoomStatus = "ACTIVE" | "INACTIVE";

/** Valid room types per API_REPORT (§1). */
// export const ROOM_TYPES = ["Standard", "VIP", "IMAX", "3D"] as const;
export const ROOM_TYPES = ["1", "2", "3", "4"] as const;

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
    roomTypeId: number
}

export interface CreateRoomPayload {
    cinemaId: number;
    name: string;
    roomTypeId: number;
    status: RoomStatus;
    description: string;
}

/** PUT /api/rooms/{id} — same shape as create (cinemaId included). */
export interface UpdateRoomPayload {
    cinemaId: number;
    name: string;
    roomTypeId: number;
    status: RoomStatus;
    description: string;
}

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

/* ─── Room seats (API_REPORT §4.6 — generate + bulk PATCH/DELETE, no
   more /layout endpoint) ─── */

/** Seat CONFIG status (whether the position is enabled at all) — distinct
 *  from the booking-time runtime status (available/held/booked) used on
 *  the customer seat map. */
export type SeatConfigStatus = "active" | "inactive";

/** GET /api/rooms/{roomId}/seats — includes the new isGap field marking
 *  walkway/non-seat positions inside the grid. */
export interface ConfigSeat {
    seatId: number;
    roomId: number;
    rowLabel: string;
    seatNumber: number;
    seatCode: string;
    seatTypeId: number;
    type: string;
    status: SeatConfigStatus | string;
    isGap: boolean;
}

export interface GetRoomSeatsParams {
    seatId?: number;
    rows?: string[];
    columns?: number[];
}

/** POST /api/rooms/{roomId}/seats/generate — per real Swagger schema.
 *  Generates `rows` rows of `column` seats each (starting from row A and
 *  continuing after any existing rows), all with the same seat type and
 *  status. There's no isGap here — mark specific seats as a gap afterward
 *  via a bulk update. */
export interface GenerateSeatsPayload {
    rows: number;
    column: number;
    seatTypeId: number;
    status: SeatConfigStatus;
}

/** Selector `mode` accepted by the bulk PATCH/DELETE endpoints. Confirmed
 *  against the live API's validation error ("Selector mode must be IDS,
 *  ROWS, or COLS") — IDS targets seat IDs, ROWS targets row labels, COLS
 *  targets column numbers (all as strings). */
export type SeatSelectorMode = "IDS" | "ROWS" | "COLS";

export interface SeatSelector {
    mode: SeatSelectorMode;
    target: string[];
}

export interface BulkUpdateSeatsPayload {
    selectors: SeatSelector[];
    update: {
        seatTypeId?: number;
        status?: SeatConfigStatus;
        isGap?: boolean;
    };
}

export interface BulkDeleteSeatsPayload {
    selectors: SeatSelector[];
}
