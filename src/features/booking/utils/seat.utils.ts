import type { Seat } from "../types/seat.types";
import { SEAT_STATUS } from "../constants/seat.constants";

export function buildSeatRowMap(seats: Seat[]): Map<string, Seat[]> {
    const map = new Map<string, Seat[]>();
    for (const seat of seats) {
        const row = (seat.seatRow ?? "?").toString().toUpperCase();
        if (!map.has(row)) map.set(row, []);
        map.get(row)!.push(seat);
    }
    for (const rowSeats of map.values()) {
        rowSeats.sort((a, b) => (a.seatCol ?? 0) - (b.seatCol ?? 0));
    }
    return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function isSeatSelectable(seat: Seat): boolean {
    return seat.status?.toUpperCase() === SEAT_STATUS.AVAILABLE;
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
}

export function getSeatLabel(seat: Seat): string {
    const row = (seat.seatRow ?? "?").toString().toUpperCase();
    const col = String(seat.seatCol ?? 0).padStart(2, "0");
    return `${row}${col}`;
}

export function getSeatTypes(seatRowMap: Map<string, Seat[]>): Set<string> {
    const types = new Set<string>();
    for (const seats of seatRowMap.values()) {
        for (const seat of seats) {
            if (seat.isGap) continue;
            types.add((seat.seatType ?? "STANDARD").toString().toUpperCase());
        }
    }
    return types;
}

/** Couple seats are sold as a pair — a customer can't book just one half.
 *  The API doesn't send an explicit pair id, so pairs are inferred: within
 *  each row, COUPLE-type seats are sorted by column and paired up two at a
 *  time in order (1st+2nd, 3rd+4th, ...), since couple seats are laid out
 *  as physically-adjacent columns. Returns a seatId → partner seatId map. */
export function buildCouplePairMap(seats: Seat[]): Map<number, number> {
    const pairs = new Map<number, number>();
    const byRow = new Map<string, Seat[]>();

    for (const seat of seats) {
        if (seat.isGap) continue;
        if ((seat.seatType ?? "").toString().toUpperCase() !== "COUPLE") continue;
        const row = (seat.seatRow ?? "?").toString().toUpperCase();
        if (!byRow.has(row)) byRow.set(row, []);
        byRow.get(row)!.push(seat);
    }

    for (const rowSeats of byRow.values()) {
        rowSeats.sort((a, b) => (a.seatCol ?? 0) - (b.seatCol ?? 0));
        for (let i = 0; i + 1 < rowSeats.length; i += 2) {
            const [a, b] = [rowSeats[i], rowSeats[i + 1]];
            pairs.set(a.seatId, b.seatId);
            pairs.set(b.seatId, a.seatId);
        }
    }

    return pairs;
}
