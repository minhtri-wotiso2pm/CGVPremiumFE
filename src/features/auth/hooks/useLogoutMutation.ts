import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutApi } from "@/services/api/auth.service";
import { logout } from "@/store/slices/authSlice";
import { notify } from "@/utils/notify";

export function useLogout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logoutApi,
        onSuccess: (response) => {
            dispatch(logout());
            queryClient.clear();
            notify.success(response.message);
            navigate("/login", { replace: true });
        },
        onError: () => {
            notify.error("Logout failed.", "Please try again.");
        },
    });
}