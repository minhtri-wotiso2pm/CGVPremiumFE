export const CINEMA_QUERY_KEY = ["cinemas"] as const;

export const CINEMA_PAGE_SIZE = 10;

export const CINEMA_STATUS_OPTIONS = [
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;

export const CINEMA_STATUS_FILTER_OPTIONS = [
    { value: "",         label: "All Status" },
    { value: "ACTIVE",   label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
] as const;
