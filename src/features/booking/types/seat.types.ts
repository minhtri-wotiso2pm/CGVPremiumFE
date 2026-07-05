/** Seat map runtime status per API_REPORT (§3): available, held, booked. */
export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";
export type SeatType = "STANDARD" | "VIP" | "COUPLE" | "IMAX";

export interface Seat {
    seatId: number;
    seatRow: string;
    seatCol: number;
    seatType: SeatType | string;
    extraPrice: number;
    price: number;
    status: SeatStatus | string;
}

export interface SeatMapResponse {
    showtimeId: number;
    roomName?: string;
    roomType?: string;
    seats: Seat[];
}

export interface SeatNavState {
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
}
