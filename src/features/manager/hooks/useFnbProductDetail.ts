import { useQuery } from "@tanstack/react-query";
import { getFnbProductDetailApi } from "@/services/api/fnb-mgmt.service";

export function useFnbProductDetail(productId: number | null) {
    return useQuery({
        queryKey: ["manager", "fnb-product-detail", productId],
        queryFn:  () => getFnbProductDetailApi(productId!),
        enabled:  productId !== null,
        staleTime: 0,
    });
}
