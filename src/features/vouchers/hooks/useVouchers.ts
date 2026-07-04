import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getVouchersApi,
    createVoucherApi,
    updateVoucherApi,
    deleteVoucherApi,
} from "@/services/api/voucher.service";
import type { GetVouchersParams, VoucherFormData } from "../types/voucher.types";
import { VOUCHER_QUERY_KEY } from "../constants/voucher.constants";
import { notify } from "@/utils/notify";

export function useVouchers(params: GetVouchersParams, enabled = true) {
    return useQuery({
        queryKey: [VOUCHER_QUERY_KEY, params.pageIndex ?? 1, params.pageSize ?? "all", params.searchKeyword ?? ""],
        queryFn: () => getVouchersApi(params),
        enabled,
        staleTime: 60 * 1000,
    });
}

export function useCreateVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: VoucherFormData) => createVoucherApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [VOUCHER_QUERY_KEY] });
            notify.success("Voucher created", "The promotion has been created successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to create", msg ?? "Could not create voucher. Please try again.");
        },
    });
}

export function useUpdateVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ voucherId, data }: { voucherId: number; data: VoucherFormData }) =>
            updateVoucherApi(voucherId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [VOUCHER_QUERY_KEY] });
            notify.success("Voucher updated", "Changes have been saved successfully.");
        },
        onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            notify.error("Failed to update", msg ?? "Could not update voucher. Please try again.");
        },
    });
}

export function useDeleteVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (voucherId: number) => deleteVoucherApi(voucherId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [VOUCHER_QUERY_KEY] });
            notify.success("Voucher deleted", "The promotion has been removed.");
        },
        onError: () => {
            notify.error("Failed to delete", "Could not delete voucher. Please try again.");
        },
    });
}
