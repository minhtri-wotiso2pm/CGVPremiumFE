/** Seat map runtime status per API_REPORT (§3): available, held, booked. */
export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";
export type SeatType = "STANDARD" | "ECONOMY" | "POOR" | "VIP" | "COUPLE" | "IMAX";

export interface Seat {
    seatId: number;
    seatRow: string;
    seatCol: number;
    seatType: SeatType | string;
    extraPrice: number;
    price: number;
    status: SeatStatus | string;
    /** True for a layout gap (aisle) — not a real, bookable seat. */
    isGap: boolean;
}

export interface SeatMapResponse {
    showtimeId: number;
    roomName?: string;
    roomType?: string;
    seats: Seat[];
}

export interface SeatNavState {
    bookingId?: number;
    showtimeId?: number;
    movieId?: number;
    movieTitle?: string;
    moviePoster?: string;
    movieDuration?: number;
    movieAgeRating?: string;

    startTime?: string;
    endTime?: string;

    cinemaId?: number;
    cinemaName?: string;

    roomName?: string;
    roomType?: string;

    seatIds?: number[];

    selectedSeats?: Seat[];

    fnbItems?: {
        productId: number;
        productName: string;
        quantity: number;
        price: number;
    }[];

    seatTotal?: number;

    fnbTotal?: number;
}