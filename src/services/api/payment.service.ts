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

/**
 * POST /payments/cash/confirm — staff-only. A cash payment is created by
 * /payments/initiate but only settles once the counter confirms the cash was
 * handed over. Returns the finalized payment (status SUCCESS).
 */
export const confirmCashPaymentApi = async (paymentId: number): Promise<PaymentStatusResponse> => {
    const { data } = await axiosInstance.post("/payments/cash/confirm", { paymentId });
    return data;
};
