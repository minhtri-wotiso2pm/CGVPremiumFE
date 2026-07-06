export const SEAT_MAP_QUERY_KEY = (showtimeId: number) =>
    ["seat-map", showtimeId] as const;

/** Seat map runtime status per API_REPORT (§3). Anything other than
 *  AVAILABLE is treated as unselectable (see isSeatSelectable). */
export const SEAT_STATUS = {
    AVAILABLE: "AVAILABLE",
    HELD:      "HELD",
    BOOKED:    "BOOKED",
} as const;

export const SEAT_TYPE_COLOR: Record<string, string> = {
    ECONOMY: "#4a9b6e",
    POOR:    "#8a8a8a",
    VIP:     "#c9a227",
    COUPLE:  "#7c5cbf",
    IMAX:    "#0d7bd4",
};

export const SEAT_TYPE_LABEL: Record<string, string> = {
    STANDARD: "Standard",
    ECONOMY:  "Economy",
    POOR:     "Poor",
    VIP:      "VIP",
    COUPLE:   "Couple",
    IMAX:     "IMAX",
};
