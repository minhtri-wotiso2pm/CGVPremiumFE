export const REVENUE_SUMMARY_QUERY_KEY = "revenue-summary";
export const MOVIE_PERFORMANCE_QUERY_KEY = "movie-performance";
export const TOP_SELLING_QUERY_KEY = "top-selling";
export const REVENUE_TIMESERIES_QUERY_KEY = "revenue-timeseries";

export const GROUP_BY_OPTIONS: { value: "day" | "week" | "month"; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
];

/** Default report window: last 30 days (inclusive of today). */
export const DEFAULT_REPORT_DAYS = 30;

export const TOP_MOVIES_LIMIT = 5;
export const TOP_FNB_LIMIT = 10;

export const EXPORT_FORMAT_OPTIONS: { value: "pdf" | "excel"; label: string }[] = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
];

export const EXPORT_TYPE_OPTIONS: { value: "revenue" | "fnb" | "occupancy"; label: string }[] = [
    { value: "revenue", label: "Revenue Summary" },
    { value: "fnb", label: "F&B Sales" },
    { value: "occupancy", label: "Occupancy" },
];
