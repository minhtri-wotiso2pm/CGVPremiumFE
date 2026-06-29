import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { updateUserInfo } from "@/store/slices/authSlice";
import { updateProfile } from "@/services/api/user.service";
import { PROFILE_QUERY_KEY } from "./useProfile";
import type { UpdateProfilePayload } from "../types/profile.type";

export const useUpdateProfile = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation({
        mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
            dispatch(updateUserInfo({ fullName: data.fullName, phone: data.phone, avatarURL: data.avatarURL }));
            notification.success({ message: "Profile updated successfully." });
            onSuccess?.();
        },
        onError: () => {
            notification.error({ message: "Failed to update profile. Please try again." });
        },
    });
};