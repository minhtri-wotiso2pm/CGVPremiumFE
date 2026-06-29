import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { uploadAvatar } from "@/services/api/user.service";
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
            notification.success({ message: "Avatar updated successfully." });
            onSuccess?.();
        },
        onError: () => {
            notification.error({ message: "Failed to upload avatar. Please try again." });
        },
    });
};