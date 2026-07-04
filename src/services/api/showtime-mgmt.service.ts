import axiosInstance from "@/services/axios/axiosInstance";
import type {
    ManagerShowtime,
    ShowtimeListResponse,
    GetManagerShowtimesParams,
    CreateShowtimePayload,
    UpdateShowtimePayload,
} from "@/features/manager/types/showtime-mgmt.types";

const normalizeShowtime = (s: Record<string, unknown>): ManagerShowtime => {
    const movie = (s.movie ?? {}) as Record<string, unknown>;
    const room = (s.room ?? {}) as Record<string, unknown>;
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
        startTime: String(s.startTime ?? ""),
        endTime: String(s.endTime ?? ""),
        basePrice: Number(s.basePrice ?? 0),
        status: String(s.status ?? "scheduled"),
        isSoldOut: Boolean(s.isSoldOut),
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
