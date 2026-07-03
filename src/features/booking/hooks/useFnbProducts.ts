import { useQuery } from "@tanstack/react-query";
import { getAvailableProductsApi } from "@/services/api/fnb.service";

export const FNB_PRODUCTS_QUERY_KEY = (cinemaId: number) =>
    ["fnb-products", cinemaId] as const;

export function useFnbProducts(cinemaId: number | undefined) {
    return useQuery({
        queryKey: FNB_PRODUCTS_QUERY_KEY(cinemaId ?? 0),
        queryFn: () => getAvailableProductsApi(cinemaId!),
        enabled: !!cinemaId,
        staleTime: 5 * 60_000,
        retry: 2,
    });
}
