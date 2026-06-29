import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import { notify } from "@/utils/notify";

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: number; payload: import("../types/user.types").UpdateUserPayload }) =>
            updateUserApi(userId, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "User updated successfully");
        },
        onError: (err: any) => {
            notify.error("Failed to update user", err?.response?.data?.message);
        },
    });
}
