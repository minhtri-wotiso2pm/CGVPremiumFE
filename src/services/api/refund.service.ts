import axiosInstance from "@/services/axios/axiosInstance";

export interface RefundRequest {
    bookingId: number;
    reason: string;
}

export const createRefund = async (data: RefundRequest) => {
    const response = await axiosInstance.post("/refunds", data);
    return response.data;
};