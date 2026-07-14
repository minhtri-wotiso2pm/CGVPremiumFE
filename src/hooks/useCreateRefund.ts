import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRefund } from "@/services/api/refund.service";

export function useCreateRefund() {

    const queryClient = useQueryClient();

    return useMutation({

        mutationFn: createRefund,

        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ["myTickets"],
            });
        },
    });
}