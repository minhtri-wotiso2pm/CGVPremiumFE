import { useMutation } from "@tanstack/react-query";
import { changePasswordApi } from "@/services/api/admin.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

export function useChangePassword() {
    return useMutation({
        mutationFn: ({ userId, payload }: { userId: number; payload: import("../types/user.types").ChangePasswordPayload }) =>
            changePasswordApi(userId, payload),
        onSuccess: (res) => {
            notify.success(res.message ?? "Password changed successfully");
        },
        onError: (err: unknown) => {
            notify.error("Failed to change password", getApiErrorMessage(err, "Could not change the password. Please try again."));
        },
    });
}
