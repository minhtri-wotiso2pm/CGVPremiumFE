import { notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { logoutApi } from "@/services/api/auth.service";

import { logout } from "@/store/slices/authSlice";

export function useLogout() {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutApi,

        onSuccess: (response) => {
            dispatch(logout());

            queryClient.clear();

            notification.success({
                message: response.message,
            });

            navigate("/login", {
                replace: true,
            });
        },

        onError: () => {
            notification.error({
                message: "Logout failed",
            });
        },
    });
}