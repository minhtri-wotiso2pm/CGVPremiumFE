import axiosInstance from "@/services/axios/axiosInstance";
import type {
    PricingRequest,
    PricingResponse,
    CreateBookingRequest,
    BookingResponse,
} from "@/features/booking/types/payment.types";
import type { MyBooking } from "@/features/booking/types/ticket.types";
import type { BookingLookupResponse } from "@/features/staff/types/fnbPickup.types";

export const calculatePricingApi = async (payload: PricingRequest): Promise<PricingResponse> => {
    const { data } = await axiosInstance.post("/bookings/calculate-pricing", payload);
    return data;
};

export const createBookingApi = async (payload: CreateBookingRequest): Promise<BookingResponse> => {
    const { data } = await axiosInstance.post("/bookings", payload);
    return data;
};

/**
 * POST /api/bookings/lookup — staff-only, read-only. Given a bookingCode, returns
 * the order and its F&B items (with current pickedUp state) so staff can review
 * before confirming pickup. Server enforces: paid, not cancelled, has F&B, and
 * belongs to the staff's own cinema.
 */
export const lookupBookingApi = async (bookingCode: string): Promise<BookingLookupResponse> => {
    const { data } = await axiosInstance.post<BookingLookupResponse>("/bookings/lookup", { bookingCode });
    return data;
};

export const getMyBookingsApi = async (): Promise<MyBooking[]> => {
    const { data } = await axiosInstance.get("/bookings/my");
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : (data?.items ?? []);
    return list.map((b) => {
        const rawMovie = (b.movie ?? {}) as Record<string, unknown>;
        return {
            ...(b as unknown as MyBooking),
            movie: {
                title: String(rawMovie.title ?? b.movieTitle ?? ""),
                posterUrl: String(rawMovie.posterUrl ?? ""),
                ageRating: String(rawMovie.ageRating ?? ""),
                durationMinutes: Number(rawMovie.durationMinutes ?? 0),
            },
        };
    });
};
