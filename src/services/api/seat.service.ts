import axiosInstance from "@/services/axios/axiosInstance";
import type { SeatMapResponse } from "@/features/booking/types/seat.types";

export const getSeatMapApi = async (showtimeId: number): Promise<SeatMapResponse> => {
    // Endpoint is public (Swagger works without auth).
    // Sending Bearer token causes backend to return 204 → use x-skip-auth to bypass interceptor.
    const { data } = await axiosInstance.get(`/showtimes/${showtimeId}/seats`, {
        headers: { "x-skip-auth": "true" },
    });

    // Normalize: API may return [] directly or { seats: [], roomName, ... }
    const rawSeats: Record<string, unknown>[] =
        Array.isArray(data)         ? data :
        Array.isArray(data?.seats)  ? data.seats :
        Array.isArray(data?.items)  ? data.items :
        Array.isArray(data?.data)   ? data.data : [];

    const seats = rawSeats.map((s) => ({
        // API uses "seatID" (capital ID) — handle all casing variants
        seatId:     Number(s.seatId    ?? s.seatID    ?? s.id          ?? 0),
        seatRow:    String(s.seatRow   ?? s.row                        ?? ""),
        seatCol:    Number(s.seatCol   ?? s.col                        ?? 0),
        seatType:   String(s.seatType  ?? s.type                       ?? "STANDARD"),
        status:     String(s.status                                    ?? "AVAILABLE"),
        extraPrice: Number(s.extraPrice ?? s.extra_price               ?? 0),
        price:      Number(s.price                                     ?? 0),
        isGap:      Boolean(s.isGap ?? s.is_gap                        ?? false),
    }));

    return {
        showtimeId: Number(data?.showtimeID ?? data?.showtimeId ?? showtimeId),
        roomName:   data?.roomName  as string | undefined,
        roomType:   data?.roomType  as string | undefined,
        seats,
    };
};
