import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { uploadAvatar } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { PROFILE_QUERY_KEY } from "./useProfile";

export const useUploadAvatar = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (file: File) => uploadAvatar(file),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            if (data?.avatarURL !== undefined) {
                dispatch(updateUserInfo({ avatarURL: data.avatarURL }));
            }
            notify.success("Avatar updated successfully.");
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error("Failed to upload avatar.", getApiErrorMessage(err, "Please try again."));
        },
    });
};
