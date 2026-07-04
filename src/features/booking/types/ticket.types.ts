export interface Ticket {
    ticketID: number;
    bookingSeatID: number;
    qrCode: string;
    status: string; // "valid" | "used" | ...
    checkedInAt: string | null;
    checkedInByID: number | null;
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

export interface MyBooking {
    bookingID: number;
    bookingCode: string;
    showtimeID: number;
    movieTitle: string;
    finalAmount: number;
    status: string;
    seats: MyBookingSeat[];
}
