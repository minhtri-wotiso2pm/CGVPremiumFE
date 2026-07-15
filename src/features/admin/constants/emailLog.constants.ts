export const EMAIL_LOG_PAGE_SIZE = 10;
export const EMAIL_LOG_PAGE_SIZE_MAX = 100;

export const DELIVERY_STATUS_OPTIONS = [
    { value: "queued", label: "Queued" },
    { value: "sending", label: "Sending" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
    { value: "skipped", label: "Skipped" },
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
    { value: "RegisterSuccess", label: "Register Success" },
    { value: "EmailVerificationRequested", label: "Email Verification Requested" },
    { value: "EmailVerified", label: "Email Verified" },
    { value: "PasswordResetRequested", label: "Password Reset Requested" },
    { value: "BookingSuccess", label: "Booking Success" },
    { value: "BookingCancelled", label: "Booking Cancelled" },
    { value: "PaymentSuccess", label: "Payment Success" },
    { value: "PaymentFailed", label: "Payment Failed" },
    { value: "RefundCompleted", label: "Refund Completed" },
    { value: "MovieScheduleChanged", label: "Movie Schedule Changed" },
    { value: "PromotionPublished", label: "Promotion Published" },
    { value: "SystemAnnouncement", label: "System Announcement" },
] as const;
