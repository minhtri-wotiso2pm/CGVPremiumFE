import { useMutation } from "@tanstack/react-query";
import { initiatePaymentApi } from "@/services/api/payment.service";

export function useInitiatePayment() {
    return useMutation({ mutationFn: initiatePaymentApi });
}
