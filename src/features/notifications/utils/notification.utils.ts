import type { NotificationItem, NotificationType } from "../types/notification.types";

/** Compact relative-time string ("2 min ago", "3 hours ago", "5 days ago"),
 *  falling back to an absolute date once it's more than a week old — no
 *  new dayjs plugin needed for this small a formatting job. */
export const fmtRelativeTime = (iso: string): string => {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;
    if (diffMs < 0) return "just now";

    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < minute) return "just now";
    if (diffMs < hour) {
        const m = Math.floor(diffMs / minute);
        return `${m} min${m === 1 ? "" : "s"} ago`;
    }
    if (diffMs < day) {
        const h = Math.floor(diffMs / hour);
        return `${h} hour${h === 1 ? "" : "s"} ago`;
    }
    if (diffMs < week) {
        const d = Math.floor(diffMs / day);
        return `${d} day${d === 1 ? "" : "s"} ago`;
    }
    return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
    booking: "Booking",
    payment: "Payment",
    refund: "Refund",
    promotion: "Promotion",
    account: "Account",
    system: "System",
};

/** Dashboard (light theme) icon-chip colors per type — same visual
 *  language as the dash-badge system already used across Manager/Admin
 *  pages. */
export const NOTIFICATION_TYPE_COLOR: Record<NotificationType, { bg: string; color: string }> = {
    booking:   { bg: "rgba(232,0,28,0.08)",   color: "#E8001C" },
    payment:   { bg: "rgba(34,197,94,0.1)",   color: "#16a34a" },
    refund:    { bg: "rgba(96,165,250,0.12)", color: "#2563eb" },
    promotion: { bg: "rgba(234,179,8,0.12)",  color: "#ca8a04" },
    account:   { bg: "rgba(148,163,184,0.14)", color: "#64748b" },
    system:    { bg: "rgba(148,163,184,0.14)", color: "#64748b" },
};

/** Customer (dark theme) icon-chip colors per type — brighter/more
 *  saturated so they read clearly against the dark background. */
export const NOTIFICATION_TYPE_COLOR_DARK: Record<NotificationType, { bg: string; color: string }> = {
    booking:   { bg: "rgba(232,0,28,0.14)",   color: "#f0a8a8" },
    payment:   { bg: "rgba(34,197,94,0.14)",  color: "#4ade80" },
    refund:    { bg: "rgba(96,165,250,0.14)", color: "#60a5fa" },
    promotion: { bg: "rgba(234,179,8,0.14)",  color: "#fbbf24" },
    account:   { bg: "rgba(148,163,184,0.14)", color: "#94a3b8" },
    system:    { bg: "rgba(148,163,184,0.14)", color: "#94a3b8" },
};

/** Where clicking a customer-facing notification should navigate.
 *
 *  The backend's `actionUrl` (e.g. "/bookings/5001") doesn't match this
 *  app's actual routes, so booking/refund notifications are re-mapped to
 *  the real ticket detail page, and promotions go to the promotions
 *  list. Anything else falls back to the raw `actionUrl` if present. */
export const resolveCustomerNotificationUrl = (n: NotificationItem): string | null => {
    if ((n.referenceType === "Booking" || n.referenceType === "Refund") && n.referenceId != null) {
        return `/customer/profile/tickets/${n.referenceId}`;
    }
    if (n.type === "promotion") {
        return "/customer/promotions";
    }
    return n.actionUrl;
};
