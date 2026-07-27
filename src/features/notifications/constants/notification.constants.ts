export const NOTIFICATION_QUERY_KEY = "notifications";
export const UNREAD_COUNT_QUERY_KEY = "notifications-unread-count";
export const NOTIFICATION_DETAIL_QUERY_KEY = "notification-detail";

export const NOTIFICATION_PAGE_SIZE = 10;
export const NOTIFICATION_PAGE_SIZE_MAX = 100;

/** No push/WebSocket infrastructure exists yet — the unread badge polls
 *  on this interval instead. Confirmed acceptable trade-off for now. */
export const UNREAD_COUNT_POLL_MS = 30_000;

/** How many items the header dropdown preview shows before "View all". */
export const NOTIFICATION_DROPDOWN_PREVIEW_COUNT = 5;

/** Only the types a customer would meaningfully want to filter by — a
 *  notification can still arrive as payment/account/system and will
 *  still display normally, it's just not offered as a filter option.
 *  labelKey values are i18n keys resolved with t() at render. */
export const NOTIFICATION_TYPE_OPTIONS = [
    { value: "booking", labelKey: "profile:notifTypes.booking" },
    { value: "refund", labelKey: "profile:notifTypes.refund" },
    { value: "promotion", labelKey: "profile:notifTypes.promotion" },
] as const;

export const NOTIFICATION_TYPE_FILTER_OPTIONS = [
    { value: "", labelKey: "profile:notifications.allTypes" },
    ...NOTIFICATION_TYPE_OPTIONS,
];

export const READ_STATUS_FILTER_OPTIONS = [
    { value: "", labelKey: "profile:notifications.filterAll" },
    { value: "unread", labelKey: "profile:notifications.unread" },
    { value: "read", labelKey: "profile:notifications.read" },
];
