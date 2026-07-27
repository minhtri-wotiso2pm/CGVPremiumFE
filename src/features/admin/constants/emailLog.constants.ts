export const EMAIL_LOG_PAGE_SIZE = 10;
export const EMAIL_LOG_PAGE_SIZE_MAX = 100;

export const DELIVERY_STATUS_OPTIONS = [
    { value: "sending", label: "Sending" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
] as const;

export const DELIVERY_STATUS_FILTER_OPTIONS = [
    { value: "", label: "All Statuses" },
    ...DELIVERY_STATUS_OPTIONS,
];

/** No "list event types" endpoint exists for email logs — this mirrors the
 *  Event Catalog from the notification module spec. Falls back to showing
 *  whatever eventType a log actually has even if it isn't in this curated
 *  list (see EmailLogTable), so nothing is ever hidden. */
export const EMAIL_EVENT_TYPE_OPTIONS = [
    { value: "register", label: "Register Success" },
    { value: "forgot_password", label: "Password Reset Requested" },
    { value: "booking_confirmed", label: "Booking Success" },
    { value: "refund_processed", label: "Refund Completed" },
] as const;
