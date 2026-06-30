export const SEAT_MAP_QUERY_KEY = (showtimeId: number) =>
    ["seat-map", showtimeId] as const;

export const SEAT_STATUS = {
    AVAILABLE:   "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    SOLD:        "SOLD",
    RESERVED:    "RESERVED",
} as const;

export const SEAT_TYPE_COLOR: Record<string, string> = {
    VIP:    "#c9a227",
    COUPLE: "#7c5cbf",
    IMAX:   "#0d7bd4",
};

export const SEAT_TYPE_LABEL: Record<string, string> = {
    STANDARD: "Standard",
    VIP:      "VIP",
    COUPLE:   "Couple",
    IMAX:     "IMAX",
};
