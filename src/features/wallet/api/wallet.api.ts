import axiosInstance from "@/services/axios/axiosInstance";
import type { WalletResponse } from "../types/wallet.types";

export const getWallet = async (): Promise<WalletResponse> => {
    const { data } = await axiosInstance.get("/user/wallet");
    return data;
};