import { useQuery } from "@tanstack/react-query";
import {
    getWalletSummaryApi,
    getWalletTransactionsApi,
    getWalletTransactionDetailApi,
} from "@/services/api/wallet.service";
import type { WalletTransactionFilters } from "../types/wallet.types";

export const WALLET_SUMMARY_KEY = ["customer", "wallet", "summary"] as const;
export const WALLET_TRANSACTIONS_KEY = ["customer", "wallet", "transactions"] as const;
export const WALLET_TRANSACTION_KEY = ["customer", "wallet", "transaction"] as const;

export function useWalletSummary() {
    return useQuery({
        queryKey: WALLET_SUMMARY_KEY,
        queryFn: getWalletSummaryApi,
        staleTime: 60_000,
    });
}

export function useWalletTransactions(filters: WalletTransactionFilters) {
    return useQuery({
        queryKey: [...WALLET_TRANSACTIONS_KEY, filters],
        queryFn: () => getWalletTransactionsApi(filters),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useWalletTransactionDetail(transactionId: number | null) {
    return useQuery({
        queryKey: [...WALLET_TRANSACTION_KEY, transactionId],
        queryFn: () => getWalletTransactionDetailApi(transactionId as number),
        enabled: transactionId != null,
        staleTime: 60_000,
    });
}

/** Fetch a larger batch of recent transactions for chart aggregation (client-side, since
 *  the API has no time-bucketed summary endpoint). */
export function useWalletTransactionsForChart() {
    return useQuery({
        queryKey: [...WALLET_TRANSACTIONS_KEY, "chart"],
        queryFn: () => getWalletTransactionsApi({ page: 1, pageSize: 100 }),
        staleTime: 60_000,
    });
}
