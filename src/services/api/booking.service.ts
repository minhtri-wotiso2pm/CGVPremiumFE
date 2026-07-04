import axiosInstance from "@/services/axios/axiosInstance";
import type {
    PricingRequest,
    PricingResponse,
    CreateBookingRequest,
    BookingResponse,
} from "@/features/booking/types/payment.types";
import type { MyBooking } from "@/features/booking/types/ticket.types";

export const calculatePricingApi = async (payload: PricingRequest): Promise<PricingResponse> => {
    const { data } = await axiosInstance.post("/bookings/calculate-pricing", payload);
    return data;
};

export const createBookingApi = async (payload: CreateBookingRequest): Promise<BookingResponse> => {
    const { data } = await axiosInstance.post("/bookings", payload);
    return data;
};

export const getMyBookingsApi = async (): Promise<MyBooking[]> => {
    const { data } = await axiosInstance.get("/bookings/my");
    return Array.isArray(data) ? data : (data?.items ?? []);
};
