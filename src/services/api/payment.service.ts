import axiosInstance from "@/services/axios/axiosInstance";
import type {
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentStatusResponse,
} from "@/features/booking/types/payment.types";

export const initiatePaymentApi = async (
    payload: PaymentInitiateRequest,
): Promise<PaymentInitiateResponse> => {
    const { data } = await axiosInstance.post("/payments/initiate", payload);
    return data;
};

export const getPaymentStatusApi = async (paymentId: number): Promise<PaymentStatusResponse> => {
    const { data } = await axiosInstance.get(`/payments/${paymentId}`);
    return data;
};
export const initiatePayment = (
    bookingId: number,
    paymentMethod: string,
) => {
    return axiosInstance.post("/payments/initiate", {
        bookingId,
        paymentMethod,
    });



};
export const createPayOS = (
    bookingId: number,
    paymentMethod: string,
) => {
    return axiosInstance.post("/payments/payos", {
        bookingId,
        paymentMethod,
    });
};