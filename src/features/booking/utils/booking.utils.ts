import type { MyBooking } from "../types/ticket.types";

/**
 * A booking is "F&B only" when it isn't tied to a screening — no showtime and
 * no seats — but does carry food & beverage items. Such bookings have no movie
 * ticket to show; they're collected at the F&B counter via the booking barcode.
 *
 * The API doesn't send an explicit flag, so this is inferred from the shape.
 */
export function isFnbOnlyBooking(b: Pick<MyBooking, "showtimeID" | "startTime" | "seats" | "fnbItems">): boolean {
    const noScreening = !b.showtimeID || !b.startTime;
    const noSeats = (b.seats?.length ?? 0) === 0;
    const hasFnb = (b.fnbItems?.length ?? 0) > 0;
    return noScreening && noSeats && hasFnb;
}
