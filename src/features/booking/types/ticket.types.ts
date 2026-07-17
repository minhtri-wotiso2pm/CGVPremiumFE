export interface Ticket {
    ticketID: number;
    bookingSeatID: number;
    qrCode: string;
    status: string; // "valid" | "used" | ...
    checkedInAt: string | null;
    checkedInByID: number | null;
    /** Seat this ticket admits — returned by GET /tickets/booking/{id}. */
    seatID?: number;
    seatRow?: string;
    seatCol?: number;
}

export interface TicketsResponse {
    success: boolean;
    tickets: Ticket[];
}

/** Booking summary from GET /api/bookings/my. */
export interface MyBookingSeat {
    seatID: number;
    seatRow: string;
    seatCol: number;
    ticketPrice: number;
}

export interface MyBookingFnbItem {
    itemName: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface MyBookingVoucher {
    voucherCode: string;
    discountApplied: number;
}

export interface MyBookingMovie {
    title: string;
    posterUrl: string;
    ageRating: string;
    durationMinutes: number;
}

export interface MyBooking {
    bookingID: number;
    bookingCode: string;
    showtimeID: number;
    /** @deprecated superseded by `movie.title` — kept in case the API still
     *  sends this flat field alongside the new nested `movie` object. */
    movieTitle: string;
    movie: MyBookingMovie;
    startTime: string;
    cinemaName: string;
    roomName: string;
    subTotal: number;
    discountAmount: number;
    finalAmount: number;
    status: string;
    bookingDate: string;
    seats: MyBookingSeat[];
    fnbItems: MyBookingFnbItem[];
    voucherApplied: MyBookingVoucher | null;
}
