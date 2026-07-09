import axiosInstance from "@/services/axios/axiosInstance";
import type {
    RefundHistoryEntry,
    RefundRequestPayload,
    RefundRequestResponse,
} from "@/features/booking/types/refund.types";

export const requestRefundApi = async (payload: RefundRequestPayload): Promise<RefundRequestResponse> => {
    const { data } = await axiosInstance.post("/refunds", payload);
    return data;
};

export const getRefundHistoryApi = async (): Promise<RefundHistoryEntry[]> => {
    const { data } = await axiosInstance.get("/refunds");
    return data;
};

export const getRefundDetailApi = async (refundId: number): Promise<RefundHistoryEntry> => {
    const { data } = await axiosInstance.get(`/refunds/${refundId}`);
    return data;
};
