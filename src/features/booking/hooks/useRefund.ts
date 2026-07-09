import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/utils/notify";
import {
    requestRefundApi,
    getRefundHistoryApi,
    getRefundDetailApi,
} from "@/services/api/refund.service";
import type { RefundRequestPayload } from "../types/refund.types";

const extractErrorMessage = (err: unknown, fallback: string): string =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export function useRequestRefund(onSuccess?: (walletBalance: number) => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RefundRequestPayload) => requestRefundApi(payload),
        onSuccess: (data) => {
            notify.success(
                "Refund successful",
                `${data.refundAmount.toLocaleString("vi-VN")} ₫ has been added to your wallet.`
            );
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-wallet"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "wallet"] });
            onSuccess?.(data.walletBalance);
        },
        onError: (err: unknown) => {
            notify.error("Refund failed", extractErrorMessage(err, "Please try again."));
        },
    });
}

export function useRefundHistory() {
    return useQuery({
        queryKey: ["refunds", "history"],
        queryFn: getRefundHistoryApi,
        staleTime: 30_000,
    });
}

export function useRefundDetail(refundId: number | null) {
    return useQuery({
        queryKey: ["refunds", "detail", refundId],
        queryFn: () => getRefundDetailApi(refundId as number),
        enabled: refundId != null,
        staleTime: 60_000,
    });
}
