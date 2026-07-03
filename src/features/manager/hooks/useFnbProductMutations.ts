import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
    createFnbProductApi,
    updateFnbProductApi,
    deleteFnbProductApi,
    uploadFnbProductImageApi,
} from "@/services/api/fnb-mgmt.service";
import type { CreateFnbProductPayload, UpdateFnbProductPayload } from "../types/fnb-mgmt.types";
import { FNB_LIST_QUERY_KEY } from "./useFnbProductList";

export function useCreateFnbProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFnbProductPayload) => createFnbProductApi(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FNB_LIST_QUERY_KEY });
            message.success("Đã thêm sản phẩm thành công");
        },
        onError: () => {
            message.error("Không thể thêm sản phẩm. Vui lòng thử lại.");
        },
    });
}

export function useUpdateFnbProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: number; payload: UpdateFnbProductPayload }) =>
            updateFnbProductApi(productId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FNB_LIST_QUERY_KEY });
            message.success("Đã cập nhật sản phẩm");
        },
        onError: () => {
            message.error("Không thể cập nhật sản phẩm. Vui lòng thử lại.");
        },
    });
}

export function useUploadFnbProductImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, file }: { productId: number; file: File }) =>
            uploadFnbProductImageApi(productId, file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FNB_LIST_QUERY_KEY });
        },
        onError: () => {
            message.warning("Sản phẩm đã lưu nhưng không thể tải ảnh lên. Vui lòng thử lại.");
        },
    });
}

export function useDeleteFnbProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (productId: number) => deleteFnbProductApi(productId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FNB_LIST_QUERY_KEY });
            message.success("Đã xóa sản phẩm");
        },
        onError: () => {
            message.error("Không thể xóa sản phẩm. Vui lòng thử lại.");
        },
    });
}
