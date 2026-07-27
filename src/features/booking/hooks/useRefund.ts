import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { notify } from "@/utils/notify";
import { formatVnd } from "@/utils/formatCurrency";
import {
    requestRefundApi,
    getRefundHistoryApi,
    getRefundDetailApi,
} from "@/services/api/refund.service";
import type { RefundRequestPayload } from "../types/refund.types";

const extractErrorMessage = (err: unknown, fallback: string): string =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

export function useRequestRefund(onSuccess?: (walletBalance: number) => void) {
    const { t } = useTranslation("booking");
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RefundRequestPayload) => requestRefundApi(payload),
        onSuccess: (data) => {
            notify.success(
                t("refund.successTitle"),
                t("refund.successBody", { amount: formatVnd(data.refundAmount) })
            );
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["user-wallet"] });
            queryClient.invalidateQueries({ queryKey: ["customer", "wallet"] });
            onSuccess?.(data.walletBalance);
        },
        onError: (err: unknown) => {
            notify.error(t("refund.failedTitle"), extractErrorMessage(err, t("common:errors.generic")));
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
