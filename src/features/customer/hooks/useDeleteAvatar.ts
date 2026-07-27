import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { deleteAvatar } from "@/services/api/user.service";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";
import { PROFILE_QUERY_KEY } from "./useProfile";

export const useDeleteAvatar = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: deleteAvatar,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            if (data?.avatarURL !== undefined) {
                dispatch(updateUserInfo({ avatarURL: data.avatarURL }));
            }
            notify.success("Avatar removed successfully.");
            onSuccess?.();
        },
        onError: (err: unknown) => {
            notify.error("Failed to remove avatar.", getApiErrorMessage(err, "Please try again."));
        },
    });
};
