import type { MyBooking } from "@/features/booking/types/ticket.types";

/** Compact "time ago" label, e.g. "3 days ago", falling back to a date. */
export function timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diff = Date.now() - then;
    if (diff < 0) return "just now";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/** A booking can be reviewed only after it has actually been used (attended /
 *  checked-in), the showtime has ended, and it hasn't been reviewed yet.
 *  `reviewReward.eligible` is the server's own check (it already factors in
 *  showtime-end-time, which this booking object has no other way to know) —
 *  prefer it, falling back to the status-only heuristic if the field is
 *  ever missing so older/partial booking payloads don't regress. */
export function canWriteReview(
    booking: Pick<MyBooking, "status" | "hasReviewed" | "reviewReward">,
): boolean {
    if (booking.hasReviewed) return false;
    if (booking.reviewReward) return booking.reviewReward.eligible;
    return booking.status.toLowerCase() === "used";
}
