export interface CheckInMovie {
    title: string;
    rating: string;
    duration: number;
    posterURL: string;
}

export interface CheckInCinema {
    name: string;
    address: string;
}

export interface CheckInRoom {
    name: string;
    roomType: string;
}

export interface CheckInShowtime {
    startTime: string;
    endTime: string;
}

export interface CheckInSeat {
    row: string;
    column: number;
    seatType: string;
    ticketPrice: number;
    isCheckedIn: boolean;
    checkedInAt: string | null;
}

export interface CheckInProduct {
    name: string;
    quantity: number;
    price: number;
}

export interface CheckInLookupResult {
    bookingId: number;
    bookingCode: string;
    customerName: string;
    movie: CheckInMovie;
    cinema: CheckInCinema;
    room: CheckInRoom;
    showtime: CheckInShowtime;
    paymentStatus: string;
    bookingStatus: string;
    checkedIn: boolean;
    seats: CheckInSeat[];
    products: CheckInProduct[];
}

export interface CheckInLookupResponse {
    success: boolean;
    data: CheckInLookupResult;
}

export interface CheckInActionResponse {
    success: boolean;
    message: string;
    bookingCode: string;
    checkedInAt: string;
}

export interface CheckInHistorySeat {
    seatCode: string;
    seatType: string;
    ticketPrice: number;
    checkedInAt: string;
}

export interface CheckInHistoryRecord {
    bookingId: number;
    bookingCode: string;
    customerName: string;
    movieTitle: string;
    cinemaName: string;
    roomName: string;
    showtimeStart: string;
    checkedInAt: string;
    staffName: string;
    seatCount: number;
    totalAmount: number;
    checkedInSeats: CheckInHistorySeat[];
}

export interface CheckInHistoryQuery {
    page?: number;
    pageSize?: number;
    from?: string;
    to?: string;
}

export interface CheckInHistoryData {
    records: CheckInHistoryRecord[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface CheckInHistoryResponse {
    success: boolean;
    data: CheckInHistoryData;
}
