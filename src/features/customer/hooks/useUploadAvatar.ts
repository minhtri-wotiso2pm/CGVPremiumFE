import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { uploadAvatar } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { PROFILE_QUERY_KEY } from "./useProfile";

export const useUploadAvatar = (onSuccess?: () => void) => {
    const { t } = useTranslation("profile");
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (file: File) => uploadAvatar(file),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            if (data?.avatarURL !== undefined) {
                dispatch(updateUserInfo({ avatarURL: data.avatarURL }));
            }
            notify.success(t("toasts.avatarUpdated"));
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error(t("toasts.avatarUploadFailed"), getApiErrorMessage(err, t("common:errors.generic")));
        },
    });
};
