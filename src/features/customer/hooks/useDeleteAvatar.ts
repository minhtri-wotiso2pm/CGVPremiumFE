import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { deleteAvatar } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { PROFILE_QUERY_KEY } from "./useProfile";

export const useDeleteAvatar = (onSuccess?: () => void) => {
    const { t } = useTranslation("profile");
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: deleteAvatar,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            if (data?.avatarURL !== undefined) {
                dispatch(updateUserInfo({ avatarURL: data.avatarURL }));
            }
            notify.success(t("toasts.avatarRemoved"));
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error(t("toasts.avatarRemoveFailed"), getApiErrorMessage(err, t("common:errors.generic")));
        },
    });
};
