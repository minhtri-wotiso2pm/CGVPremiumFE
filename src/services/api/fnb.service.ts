import axiosInstance from "@/services/axios/axiosInstance";
import type { ProductsResponse } from "@/features/booking/types/fnb.types";

export const getAvailableProductsApi = async (
    cinemaId: number
): Promise<ProductsResponse> => {
    const { data } = await axiosInstance.get("/products/available", {
        params: { cinemaId },
        headers: { "x-skip-auth": "true" },
    });
    // Normalize: API trả { products: [...] }
    if (Array.isArray(data)) return { products: data };
    if (Array.isArray(data?.products)) return data as ProductsResponse;
    return { products: [] };
};
