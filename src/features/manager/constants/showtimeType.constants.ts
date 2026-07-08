export const SHOWTIME_TYPE_QUERY_KEY = "showtime-types";
export const SHOWTIME_TYPE_DETAIL_QUERY_KEY = "showtime-type-detail";

/** No per-cinema search/sort param exists on GET /showtime-types, and the
 *  number of types per cinema is small — fetch everything in one page and
 *  do search/sort/pagination client-side (same pattern as
 *  CinemaManagementPage, which faces the same API shape). */
export const SHOWTIME_TYPE_FETCH_ALL_PAGE_SIZE = 100;
export const SHOWTIME_TYPE_PAGE_SIZE = 20;

/** Fixed by the backend — room turnaround/cleaning time between showtimes.
 *  Not exposed by any API field; confirmed with the team to always be 30
 *  minutes server-side. Used only for the client-side Local Preview
 *  estimate — the real end time is whatever the backend computes. */
export const CLEANING_DURATION_MIN = 30;

export const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export const SORT_OPTIONS = [
    { value: "name-asc", label: "Name (A–Z)" },
    { value: "name-desc", label: "Name (Z–A)" },
    { value: "slots-desc", label: "Most Slots" },
    { value: "slots-asc", label: "Fewest Slots" },
];
