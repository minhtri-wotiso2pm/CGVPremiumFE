import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { updateProfile } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { PROFILE_QUERY_KEY } from "./useProfile";
import type { UpdateProfilePayload } from "../types/profile.type";

export const useUpdateProfile = (onSuccess?: () => void) => {
    const { t } = useTranslation("profile");
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            dispatch(updateUserInfo({ fullName: data.fullName, phone: data.phone, avatarURL: data.avatarURL }));
            notify.success(t("toasts.profileUpdated"));
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error(t("toasts.profileUpdateFailed"), getApiErrorMessage(err, t("common:errors.generic")));
        },
    });
};
