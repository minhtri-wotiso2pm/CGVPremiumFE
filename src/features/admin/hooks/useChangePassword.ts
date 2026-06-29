import { useMutation } from "@tanstack/react-query";
import { changePasswordApi } from "@/services/api/admin.service";
import { notify } from "@/utils/notify";

export function useChangePassword() {
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: number; payload: import("../types/user.types").ChangePasswordPayload }) =>
            changePasswordApi(userId, payload),
        onSuccess: (res) => {
            notify.success(res.message ?? "Password changed successfully");
        },
        onError: (err: any) => {
            notify.error("Failed to change password", err?.response?.data?.message);
        },
    });
}
