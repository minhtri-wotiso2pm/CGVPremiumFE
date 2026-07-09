export const ROOM_QUERY_KEY = ["rooms"] as const;
export const SEAT_TYPE_QUERY_KEY = ["seat-types"] as const;
export const ROOM_SEATS_QUERY_KEY = (roomId: number) => ["room-seats", roomId] as const;

export const ROOM_PAGE_SIZE = 10;
export const SEAT_TYPE_PAGE_SIZE = 10;

export const ROOM_STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;

export const ROOM_STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;

/** Seat CONFIG status (not the booking runtime status). */
export const SEAT_CONFIG_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
] as const;

/** Server-side limits per API_REPORT (§4.6). */
export const MAX_SEAT_ROWS = 100;
export const MAX_SEAT_COLUMNS = 100;
export const MAX_SEAT_POSITIONS = 10_000;
