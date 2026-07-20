import axiosInstance from "@/services/axios/axiosInstance";
import type {
    ManagerShowtime,
    ShowtimeListResponse,
    GetManagerShowtimesParams,
    GetShowtimeRangeParams,
    CreateShowtimePayload,
    UpdateShowtimePayload,
} from "@/features/manager/types/showtime-mgmt.types";

const normalizeShowtime = (s: Record<string, unknown>): ManagerShowtime => {
    const movie = (s.movie ?? {}) as Record<string, unknown>;
    const room = (s.room ?? {}) as Record<string, unknown>;
    const cinema = (s.cinema ?? null) as Record<string, unknown> | null;
    return {
        showtimeId: Number(s.showtimeId ?? s.showtimeID ?? 0),
        movie: {
            movieId: Number(movie.movieId ?? movie.movieID ?? 0),
            title: String(movie.title ?? ""),
            ageRating: movie.ageRating as string | undefined,
            durationMin: movie.durationMin != null ? Number(movie.durationMin) : undefined,
            posterUrl: (movie.posterUrl ?? null) as string | null,
        },
        room: {
            roomId: Number(room.roomId ?? room.roomID ?? 0),
            roomName: String(room.roomName ?? ""),
            roomType: String(room.roomType ?? ""),
            capacity: room.capacity != null ? Number(room.capacity) : undefined,
        },
        cinema: cinema
            ? {
                  cinemaId: Number(cinema.cinemaId ?? cinema.cinemaID ?? 0),
                  cinemaName: String(cinema.cinemaName ?? ""),
                  address: cinema.address != null ? String(cinema.address) : undefined,
              }
            : undefined,
        startTime: String(s.startTime ?? ""),
        endTime: String(s.endTime ?? ""),
        basePrice: Number(s.basePrice ?? 0),
        // API may return UPPERCASE (SCHEDULED/COMPLETED) — normalize so the
        // lowercase badge/color maps across the app match consistently.
        status: String(s.status ?? "scheduled").toLowerCase(),
        isSoldOut: Boolean(s.isSoldOut),
        isActive: s.isActive != null ? Boolean(s.isActive) : undefined,
    };
};

export const getManagerShowtimesApi = async (
    params: GetManagerShowtimesParams,
): Promise<ShowtimeListResponse> => {
    const { data } = await axiosInstance.get("/showtimes", { params });
    const rawItems: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : (data?.items ?? []);
    return {
        items: rawItems.map(normalizeShowtime),
        page: Number(data?.page ?? 1),
        pageSize: Number(data?.pageSize ?? rawItems.length),
        totalItems: Number(data?.totalItems ?? rawItems.length),
        totalPages: Number(data?.totalPages ?? 1),
    };
};

/** One batched request for a calendar window (replaces N per-day calls). */
export const getShowtimesRangeApi = async (
    params: GetShowtimeRangeParams,
): Promise<ManagerShowtime[]> => {
    const { data } = await axiosInstance.get("/showtimes/range", { params });
    const rawItems: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : (data?.items ?? []);
    return rawItems.map(normalizeShowtime);
};

export const createShowtimeApi = async (payload: CreateShowtimePayload): Promise<ManagerShowtime> => {
    const { data } = await axiosInstance.post("/showtimes", payload);
    return normalizeShowtime(data);
};

export const updateShowtimeApi = async (
    showtimeId: number,
    payload: UpdateShowtimePayload,
): Promise<ManagerShowtime> => {
    const { data } = await axiosInstance.put(`/showtimes/${showtimeId}`, payload);
    return normalizeShowtime(data);
};

export const deleteShowtimeApi = async (showtimeId: number): Promise<void> => {
    await axiosInstance.delete(`/showtimes/${showtimeId}`);
};
