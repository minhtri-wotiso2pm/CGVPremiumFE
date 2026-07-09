import axiosInstance from "@/services/axios/axiosInstance";
import type { WalletResponse } from "@/features/booking/types/payment.types";
import type {
    WalletSummary,
    WalletTransactionDetail,
    WalletTransactionFilters,
    WalletTransactionListResponse,
} from "@/features/customer/types/wallet.types";

export const getUserWalletApi = async (): Promise<WalletResponse> => {
    const { data } = await axiosInstance.get("/user/wallet");
    return data;
};

export const getWalletSummaryApi = async (): Promise<WalletSummary> => {
    const { data } = await axiosInstance.get("/wallet/summary");
    return data;
};

export const getWalletTransactionsApi = async (
    filters: WalletTransactionFilters
): Promise<WalletTransactionListResponse> => {
    const { data } = await axiosInstance.get("/wallet/transactions", { params: filters });
    return data;
};

export const getWalletTransactionDetailApi = async (
    transactionId: number
): Promise<WalletTransactionDetail> => {
    const { data } = await axiosInstance.get(`/wallet/transactions/${transactionId}`);
    return data;
};
