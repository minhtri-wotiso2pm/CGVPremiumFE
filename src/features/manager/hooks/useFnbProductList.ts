import { useQuery } from "@tanstack/react-query";
import { getFnbProductsApi } from "@/services/api/fnb-mgmt.service";
import type { FnbProduct } from "../types/fnb-mgmt.types";

export const FNB_LIST_QUERY_KEY = ["manager", "fnb-products"] as const;

export function useFnbProductList() {
    return useQuery({
        queryKey: FNB_LIST_QUERY_KEY,
        queryFn:  getFnbProductsApi,
        staleTime: 30_000,
        select: (data) => data.products as FnbProduct[],
    });
}
