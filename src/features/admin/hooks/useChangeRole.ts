import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeRoleApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import { notify } from "@/utils/notify";

export function useChangeRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: number; payload: import("../types/user.types").ChangeRolePayload }) =>
            changeRoleApi(userId, payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "Role updated successfully");
        },
        onError: (err: any) => {
            notify.error("Failed to change role", err?.response?.data?.message);
        },
    });
}
