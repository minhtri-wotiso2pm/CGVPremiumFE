import i18n from "@/i18n";
import { formatDate } from "@/utils/formatDate";
import type { NotificationItem, NotificationType } from "../types/notification.types";

/** Compact relative-time string ("2 mins ago", "3 hours ago", "5 days ago"),
 *  falling back to an absolute date once it's more than a week old.
 *  Resolves through i18n so the string follows the active language. */
export const fmtRelativeTime = (iso: string): string => {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;

    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (diffMs < minute) return i18n.t("common:time.justNow");
    if (diffMs < hour) {
        return i18n.t("common:time.minutesAgo", { count: Math.floor(diffMs / minute) });
    }
    if (diffMs < day) {
        return i18n.t("common:time.hoursAgo", { count: Math.floor(diffMs / hour) });
    }
    if (diffMs < week) {
        return i18n.t("common:time.daysAgo", { count: Math.floor(diffMs / day) });
    }
    return formatDate(iso);
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
    booking: "Booking",
    payment: "Payment",
    refund: "Refund",
    promotion: "Promotion",
    account: "Account",
    system: "System",
    analytics: "Analytics",
    report: "Report",
    movie: "Movie",
    showtime: "Showtime",
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
    analytics: { bg: "rgba(139,92,246,0.12)", color: "#7c3aed" },
    report:    { bg: "rgba(20,184,166,0.12)", color: "#0d9488" },
    movie:     { bg: "rgba(236,72,153,0.12)", color: "#db2777" },
    showtime:  { bg: "rgba(249,115,22,0.12)", color: "#ea580c" },
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
    analytics: { bg: "rgba(139,92,246,0.16)", color: "#c4b5fd" },
    report:    { bg: "rgba(20,184,166,0.16)", color: "#5eead4" },
    movie:     { bg: "rgba(236,72,153,0.16)", color: "#f9a8d4" },
    showtime:  { bg: "rgba(249,115,22,0.16)", color: "#fdba74" },
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
