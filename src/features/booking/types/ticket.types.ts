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

export interface MyBooking {
    bookingID: number;
    bookingCode: string;
    showtimeID: number;
    movieTitle: string;
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
