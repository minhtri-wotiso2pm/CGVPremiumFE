export const SHOWTIME_MGMT_QUERY_KEY = "manager-showtimes";

export const SHOWTIME_PAGE_SIZE = 10;

export const SHOWTIME_STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
] as const;

export const SHOWTIME_STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Status" },
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
] as const;

/** Badge class per status (reuses dashboard badge styles). */
export const SHOWTIME_STATUS_BADGE: Record<string, string> = {
    scheduled: "dash-badge--active",
    completed: "dash-badge--pending",
    cancelled: "dash-badge--inactive",
};
