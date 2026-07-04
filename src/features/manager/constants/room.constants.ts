import { ROOM_TYPES } from "../types/room.types";

export const ROOM_QUERY_KEY = ["rooms"] as const;
export const SEAT_TYPE_QUERY_KEY = ["seat-types"] as const;
export const ROOM_LAYOUT_QUERY_KEY = (roomId: number) => ["room-layout", roomId] as const;

export const ROOM_PAGE_SIZE = 10;
export const SEAT_TYPE_PAGE_SIZE = 10;

export const ROOM_TYPE_OPTIONS = ROOM_TYPES.map((t) => ({ value: t, label: t }));

export const ROOM_TYPE_FILTER_OPTIONS = [
    { value: "", label: "All Types" },
    ...ROOM_TYPE_OPTIONS,
];

export const ROOM_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;

export const ROOM_STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;

/** Seat status used inside the layout editor. */
export const SEAT_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
} as const;
