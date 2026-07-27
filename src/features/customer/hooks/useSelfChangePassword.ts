import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { changeOwnPassword, type ChangePasswordPayload } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage, getApiMessage } from "@/utils/apiMessage";

export function useSelfChangePassword(onSuccess?: () => void) {
    const { t } = useTranslation("profile");
    return useMutation({
        mutationFn: (payload: ChangePasswordPayload) => changeOwnPassword(payload),
        onSuccess: (data) => {
            notify.success(getApiMessage(data, t("toasts.passwordChanged")));
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error(t("toasts.passwordChangeFailed"), getApiErrorMessage(err, t("common:errors.generic")));
        },
    });
}
