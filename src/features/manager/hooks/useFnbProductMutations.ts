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
            message.success("Product added successfully");
        },
        onError: () => {
            message.error("Could not add the product. Please try again.");
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
            message.success("Product updated");
        },
        onError: () => {
            message.error("Could not update the product. Please try again.");
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
            message.warning("The product was saved but the image could not be uploaded. Please try again.");
        },
    });
}

export function useDeleteFnbProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (productId: number) => deleteFnbProductApi(productId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FNB_LIST_QUERY_KEY });
            message.success("Product deleted");
        },
        onError: () => {
            message.error("Could not delete the product. Please try again.");
        },
    });
}
