import { useMutation } from "@tanstack/react-query";
import { calculatePricingApi } from "@/services/api/booking.service";

export function useCalculatePricing() {
    return useMutation({ mutationFn: calculatePricingApi });
}
