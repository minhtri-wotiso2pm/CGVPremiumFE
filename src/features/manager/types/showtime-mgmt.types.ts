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

export interface ShowtimeCinemaRef {
    cinemaId: number;
    cinemaName: string;
    address?: string;
}

export interface ManagerShowtime {
    showtimeId: number;
    movie: ShowtimeMovieRef;
    room: ShowtimeRoomRef;
    /** Present on the /showtimes/range response; optional elsewhere. */
    cinema?: ShowtimeCinemaRef;
    startTime: string;
    endTime: string;
    basePrice: number;
    /** Always normalized to lowercase (API may return UPPERCASE). */
    status: ShowtimeStatus | string;
    isSoldOut: boolean;
    /** false for past/inactive showtimes (from /showtimes/range). */
    isActive?: boolean;
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

/** GET /showtimes/range — one batched call for a calendar window. */
export interface GetShowtimeRangeParams {
    cinemaId: number;
    startDate: string; // YYYY-MM-DD (no leading space!)
    endDate: string;   // YYYY-MM-DD
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
