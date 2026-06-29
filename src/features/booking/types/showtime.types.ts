export interface ShowtimeCinema {
    cinemaId: number;
    cinemaName: string;
    address?: string;
    city?: string;
}

export interface ShowtimeRoom {
    roomId: number;
    roomName: string;
    roomType: string;
    capacity?: number;
}

export interface ShowtimeItem {
    showtimeId: number;
    startTime: string;
    endTime?: string;
    status: string;
    isSoldOut: boolean;
    cinema: ShowtimeCinema;
    room: ShowtimeRoom;
}

export interface ShowtimeListResponse {
    items: ShowtimeItem[];
    total?: number;
    totalItems?: number;
    page?: number;
    pageSize?: number;
}

export interface GetShowtimesParams {
    movieName: string;
    date: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
}
