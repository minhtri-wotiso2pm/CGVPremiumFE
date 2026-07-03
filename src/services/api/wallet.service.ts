import axiosInstance from "@/services/axios/axiosInstance";
import type { WalletResponse } from "@/features/booking/types/payment.types";

export const getUserWalletApi = async (): Promise<WalletResponse> => {
    const { data } = await axiosInstance.get("/user/wallet");
    return data;
};
