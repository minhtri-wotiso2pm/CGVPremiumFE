export const ACTIVITY_LOG_QUERY_KEY = "activity-logs";
export const ACTIVITY_LOG_DETAIL_QUERY_KEY = "activity-log-detail";
export const ACTION_TYPES_QUERY_KEY = "activity-log-action-types";

export const ACTIVITY_LOG_PAGE_SIZE = 10;
export const ACTIVITY_LOG_PAGE_SIZE_MAX = 100;

/** No "list modules" endpoint exists in the API — this is a curated list
 *  of the system's actual domains, kept in sync manually. Falls back to
 *  showing whatever module a log actually has even if it isn't in this
 *  list (see LogFilters), so nothing is ever hidden by an incomplete list. */
export const ACTIVITY_LOG_MODULE_OPTIONS: { value: string; label: string }[] = [
    { value: "User",      label: "User" },
    { value: "Auth",      label: "Auth" },
    { value: "Cinema",    label: "Cinema" },
    { value: "Room",      label: "Room" },
    { value: "SeatType",  label: "Seat Type" },
    { value: "Movie",     label: "Movie" },
    { value: "Showtime",  label: "Showtime" },
    { value: "Booking",   label: "Booking" },
    { value: "Payment",   label: "Payment" },
    { value: "Voucher",   label: "Voucher" },
    { value: "Fnb",       label: "F&B" },
    { value: "System",    label: "System" },
];

export type LogSeverity = "danger" | "warning" | "info" | "neutral";

/** Action types are backend-driven (GET /action-types), so severity is
 *  classified by keyword rather than a fixed enum — matches the module
 *  spec: danger = delete/remove/ban, warning = update/change, info =
 *  create/add, neutral = everything else (view/system/login...). */
export function getActionSeverity(actionType: string): LogSeverity {
    const t = actionType.toLowerCase();
    if (/delete|remove|ban|revoke|deactivate/.test(t)) return "danger";
    if (/update|edit|change|modify/.test(t)) return "warning";
    if (/create|add|register|approve/.test(t)) return "info";
    return "neutral";
}
