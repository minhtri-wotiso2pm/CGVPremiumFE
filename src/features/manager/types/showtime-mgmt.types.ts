export type ShowtimeStatus = "scheduled" | "cancelled" | "completed";

export interface ShowtimeMovieRef {
    movieId: number;
    title: string;
    ageRating?: string;
    durationMin?: number;
    posterUrl?: string | null;
}

export interface ShowtimeRoomRef {
    roomId: number;
    roomName: string;
    roomType: string;
    capacity?: number;
}

export interface ManagerShowtime {
    showtimeId: number;
    movie: ShowtimeMovieRef;
    room: ShowtimeRoomRef;
    startTime: string;
    endTime: string;
    basePrice: number;
    status: ShowtimeStatus | string;
    isSoldOut: boolean;
}

export interface ShowtimeListResponse {
    items: ManagerShowtime[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GetManagerShowtimesParams {
    cinemaId?: number;
    date?: string;   // YYYY-MM-DD
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: string;
}

/** POST auto-derives status from startTime — do not send it on create. */
export interface CreateShowtimePayload {
    movieId: number;
    roomId: number;
    startTime: string; // ISO 8601 with +07:00
    basePrice: number;
}

export interface UpdateShowtimePayload extends CreateShowtimePayload {
    status?: string;
}

export type ShowtimeModalType = "create" | "edit" | "delete";
