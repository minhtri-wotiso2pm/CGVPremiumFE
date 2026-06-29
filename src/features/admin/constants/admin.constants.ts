export const ADMIN_PAGE_SIZE = 10;

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export const ROLE_OPTIONS = [
    { value: "customer", label: "Customer" },
    { value: "staff",    label: "Staff" },
    { value: "manager",  label: "Manager" },
    { value: "admin",    label: "Admin" },
];

export const STATUS_OPTIONS = [
    { value: "active",   label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "banned",   label: "Banned" },
];

export const ROLE_FILTER_OPTIONS = [
    { value: "", label: "All Roles" },
    ...ROLE_OPTIONS,
];

export const STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Statuses" },
    ...STATUS_OPTIONS,
];
