import axiosInstance from "@/services/axios/axiosInstance";

import type {
    FnbProductListResponse,
    FnbProductDetail,
    CreateFnbProductPayload,
    UpdateFnbProductPayload,
} from "@/features/manager/types/fnb-mgmt.types";

export const getFnbProductsApi = (): Promise<FnbProductListResponse> =>
    axiosInstance.get("/products").then((r) => r.data);

export const getFnbProductDetailApi = (productId: number): Promise<FnbProductDetail> =>
    axiosInstance.get(`/products/${productId}`).then((r) => r.data);

export const createFnbProductApi = (payload: CreateFnbProductPayload): Promise<FnbProductDetail> =>
    axiosInstance.post("/products", payload).then((r) => r.data);

export const updateFnbProductApi = (
    productId: number,
    payload: UpdateFnbProductPayload,
): Promise<FnbProductDetail> =>
    axiosInstance.put(`/products/${productId}`, payload).then((r) => r.data);

export const deleteFnbProductApi = (productId: number): Promise<void> =>
    axiosInstance.delete(`/products/${productId}`).then((r) => r.data);

export const uploadFnbProductImageApi = (productId: number, file: File): Promise<FnbProductDetail> => {
    const formData = new FormData();
    formData.append("File", file);
    return axiosInstance
        .put(`/products/${productId}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
};
