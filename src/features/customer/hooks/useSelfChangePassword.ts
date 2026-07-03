import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { changeOwnPassword, type ChangePasswordPayload } from "@/services/api/user.service";

export function useSelfChangePassword(onSuccess?: () => void) {
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) => changeOwnPassword(payload),
        onSuccess: (data) => {
            message.success(data.message || "Đổi mật khẩu thành công!");
            onSuccess?.();
        },
        onError: (err: unknown) => {
            const msg =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? "Đổi mật khẩu thất bại. Vui lòng thử lại.";
            message.error(msg);
        },
    });
}
