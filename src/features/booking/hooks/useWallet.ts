import { useQuery } from "@tanstack/react-query";
import { getUserWalletApi } from "@/services/api/wallet.service";

export function useWallet() {
    return useQuery({
        queryKey: ["user-wallet"],
        queryFn: getUserWalletApi,
        staleTime: 60_000,
        retry: 1,
    });
}
