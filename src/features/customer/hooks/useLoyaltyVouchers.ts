import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
    getRedeemableVouchersApi,
    getMyVouchersApi,
    redeemVoucherApi,
} from "@/services/api/loyaltyVoucher.service";
import { MEMBERSHIP_INFO_KEY, POINTS_HISTORY_KEY } from "./useMembership";
import { notify } from "@/utils/notify";

export const CUSTOMER_VOUCHERS_REDEEMABLE_KEY = ["customer", "vouchers", "redeemable"] as const;
export const CUSTOMER_MY_VOUCHERS_KEY = ["customer", "vouchers", "my-vouchers"] as const;

/** `enabled` defaults to true for the usual always-logged-in call sites —
 *  pass `false` when the consumer might mount for a guest (e.g. the checkout
 *  voucher picker, reachable during guest checkout) so no authenticated
 *  request fires and 401s into the global "session expired" handling. */
export function useRedeemableVouchers(enabled = true) {
    return useQuery({
        queryKey: CUSTOMER_VOUCHERS_REDEEMABLE_KEY,
        queryFn: getRedeemableVouchersApi,
        staleTime: 60_000,
        enabled,
    });
}

export function useMyVouchers(enabled = true) {
    return useQuery({
        queryKey: CUSTOMER_MY_VOUCHERS_KEY,
        queryFn: getMyVouchersApi,
        staleTime: 30_000,
        enabled,
    });
}

export function useRedeemVoucher() {
    const { t } = useTranslation("profile");
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (voucherId: number) => redeemVoucherApi(voucherId),
        onSuccess: (result) => {
            // Points spent may change other cards' affordability, a new entry appears
            // in "My Vouchers", and both the points balance and history changed.
            queryClient.invalidateQueries({ queryKey: CUSTOMER_VOUCHERS_REDEEMABLE_KEY });
            queryClient.invalidateQueries({ queryKey: CUSTOMER_MY_VOUCHERS_KEY });
            queryClient.invalidateQueries({ queryKey: MEMBERSHIP_INFO_KEY });
            queryClient.invalidateQueries({ queryKey: POINTS_HISTORY_KEY });
            notify.success(t("toasts.voucherRedeemed"), result.message ?? t("toasts.voucherRedeemedDesc", { code: result.voucherCode }));
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error(t("toasts.redeemFailed"), msg ?? t("toasts.redeemFailedDesc"));
        },
    });
}
