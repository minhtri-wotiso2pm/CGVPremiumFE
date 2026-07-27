import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserApi } from "@/services/api/admin.service";
import { ADMIN_USERS_QUERY_KEY } from "../constants/admin.constants";
import { notify } from "@/utils/notify";
import { getApiErrorMessage } from "@/utils/apiMessage";

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => deleteUserApi(userId),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
            notify.success(res.message ?? "User deleted successfully");
        },
        onError: (err: unknown) => {
            notify.error("Failed to delete user", getApiErrorMessage(err, "Could not delete the user. Please try again."));
        },
    });
}
