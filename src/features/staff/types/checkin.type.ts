export interface CheckInRequest {
    qrCode: string;
}

export interface CheckInResponse {
    success: boolean;
    message: string;

    bookingCode: string;

    movieTitle: string;

    cinemaName: string;

    roomName: string;

    showtime: string;

    seats: string[];

    checkedInAt?: string;
}