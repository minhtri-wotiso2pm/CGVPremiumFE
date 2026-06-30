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
            types.add((seat.seatType ?? "STANDARD").toString().toUpperCase());
        }
    }
    return types;
}
