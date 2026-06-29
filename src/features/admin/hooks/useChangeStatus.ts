import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStatusApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import { notify } from "@/utils/notify";

export function useChangeStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: number; payload: import("../types/user.types").ChangeStatusPayload }) =>
            changeStatusApi(userId, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "Status updated successfully");
        },
        onError: (err: any) => {
            notify.error("Failed to change status", err?.response?.data?.message);
        },
    });
}
